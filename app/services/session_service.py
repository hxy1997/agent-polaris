from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
import json
from pathlib import Path

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

from app.domain.models import SceneDraft, SceneModelConfig
from app.runtime.agent_factory import AgentSpec, build_deep_agent
from app.runtime.chat_runner import stream_chat_chunks
from app.schemas.chat import (
    ChatHistoryEntryResponse,
    ChatMessageResponse,
    ChatSessionMessage,
    ChatSessionMessagesResponse,
    ChatSessionResponse,
    ChatSceneSummary,
)
from app.storage.chat_history_repository import ChatHistoryRepository, utc_now_iso
from app.storage.file_checkpointer import FileCheckpointSaver
from app.storage.scene_repository import BaseSceneRepository, SceneRepository

DEFAULT_USER_ID = "0000"


@dataclass
class SessionState:
    scene_id: str
    user_id: str
    messages: list[str] = field(default_factory=list)
    pending_stream_factory: Callable[[], Iterator[str]] | None = None


class SessionService:
    def __init__(
        self,
        platform_root: Path,
        session_root: Path,
        *,
        agent_builder=build_deep_agent,
        chat_streamer=stream_chat_chunks,
        api_key: str = "",
    ):
        self.platform_root = platform_root
        self.session_root = session_root
        self.agent_builder = agent_builder
        self.chat_streamer = chat_streamer
        self.api_key = api_key
        self.history_repository = ChatHistoryRepository(session_root)
        self.checkpointer = FileCheckpointSaver(session_root / "checkpoints")
        self._counter = self._build_session_counter()
        self._sessions: dict[str, SessionState] = {}
        self.scene_repository = SceneRepository(platform_root)
        self.base_scene_repository = BaseSceneRepository(platform_root)

    def list_scenes(self) -> list[ChatSceneSummary]:
        return [
            ChatSceneSummary(id=scene.id, name=scene.name)
            for scene in self.scene_repository.list_scenes()
        ]

    def create_session(self, scene_id: str, user_id: str | None = None) -> ChatSessionResponse:
        self.scene_repository.get_scene(scene_id)
        session_id = f"session-{next(self._counter):03d}"
        normalized_user_id = self._normalize_user_id(user_id)
        self._sessions[session_id] = SessionState(scene_id=scene_id, user_id=normalized_user_id)
        self.history_repository.upsert_entry(
            session_id=session_id,
            user_id=normalized_user_id,
            scene_id=scene_id,
            updated_at=utc_now_iso(),
        )
        return ChatSessionResponse(
            session_id=session_id,
            scene_id=scene_id,
            user_id=normalized_user_id,
        )

    def get_session(self, session_id: str) -> ChatSessionResponse:
        session = self._get_or_restore_session(session_id)
        return ChatSessionResponse(
            session_id=session_id,
            scene_id=session.scene_id,
            user_id=session.user_id,
        )

    def add_message(self, session_id: str, content: str, user_id: str | None = None) -> ChatMessageResponse:
        normalized_user_id = self._normalize_user_id(user_id)
        session = self._get_or_restore_session(session_id, normalized_user_id)
        self._assert_session_owner(session, normalized_user_id)
        scene = self.scene_repository.get_scene(session.scene_id)
        model_config = self.scene_repository.get_scene_model_config(session.scene_id)
        self._validate_model_config(model_config)
        agent = self.agent_builder(self._build_agent_spec(scene, model_config, session_id))

        session.messages.append(content)
        if len(session.messages) == 1:
            self.history_repository.upsert_entry(
                session_id=session_id,
                user_id=session.user_id,
                scene_id=session.scene_id,
                title=content.strip() or "未命名会话",
                updated_at=utc_now_iso(),
            )

        session.pending_stream_factory = lambda: self.chat_streamer(
            agent,
            content,
            session_id=session_id,
        )
        return ChatMessageResponse(session_id=session_id, status="accepted")

    def stream_session(self, session_id: str):
        session = self._get_or_restore_session(session_id)
        if session.pending_stream_factory is None:
            return iter(())

        stream_factory = session.pending_stream_factory
        session.pending_stream_factory = None

        def iterator():
            for chunk in stream_factory():
                yield chunk

            self.history_repository.upsert_entry(
                session_id=session_id,
                user_id=session.user_id,
                scene_id=session.scene_id,
                updated_at=utc_now_iso(),
            )

        return iterator()

    def list_history(self, scene_id: str, user_id: str | None = None) -> list[ChatHistoryEntryResponse]:
        normalized_user_id = self._normalize_user_id(user_id)
        self.scene_repository.get_scene(scene_id)
        return [
            ChatHistoryEntryResponse(
                session_id=entry.session_id,
                scene_id=entry.scene_id,
                user_id=entry.user_id,
                title=entry.title,
                created_at=entry.created_at,
                updated_at=entry.updated_at,
            )
            for entry in self.history_repository.list_entries(normalized_user_id, scene_id)
        ]

    def get_session_messages(
        self,
        session_id: str,
        user_id: str | None = None,
    ) -> ChatSessionMessagesResponse:
        normalized_user_id = self._normalize_user_id(user_id)
        session = self._sessions.get(session_id)
        history_entry = self.history_repository.find_session(normalized_user_id, session_id)
        if history_entry is None:
            raise KeyError(session_id)

        if session is not None:
            self._assert_session_owner(session, normalized_user_id)
            scene_id = session.scene_id
        else:
            scene_id = history_entry.scene_id
            self._sessions[session_id] = SessionState(
                scene_id=history_entry.scene_id,
                user_id=history_entry.user_id,
            )

        checkpoint_tuple = self.checkpointer.get_tuple(
            {
                "configurable": {
                    "thread_id": session_id,
                }
            }
        )
        messages = self._convert_checkpoint_messages(checkpoint_tuple.checkpoint["channel_values"].get("messages", [])) if checkpoint_tuple else []

        return ChatSessionMessagesResponse(
            session_id=session_id,
            scene_id=scene_id,
            user_id=normalized_user_id,
            messages=messages,
        )

    def _build_agent_spec(
        self,
        scene: SceneDraft,
        model_config: SceneModelConfig,
        session_id: str,
    ) -> AgentSpec:
        runtime_root = self.session_root / session_id
        runtime_root.mkdir(parents=True, exist_ok=True)
        return AgentSpec(
            system_prompt=self._build_system_prompt(scene),
            skill_paths=[],
            tool_names=[],
            runtime_root=runtime_root,
            model_config=model_config,
            api_key=self.api_key,
            checkpointer=self.checkpointer,
        )

    def _build_system_prompt(self, scene: SceneDraft) -> str:
        prompt_parts: list[str] = []

        if scene.base_scene_id:
            base_scene = self.base_scene_repository.get_base_scene(scene.base_scene_id)
            base_prompt_path = (
                self.platform_root / "base-scenes" / base_scene.id / base_scene.system_prompt_path
            )
            if base_prompt_path.exists():
                prompt_parts.append(base_prompt_path.read_text(encoding="utf-8").strip())

        if scene.system_prompt_path:
            scene_prompt_path = self.platform_root / "scenes" / scene.id / scene.system_prompt_path
            if scene_prompt_path.exists():
                prompt_parts.append(scene_prompt_path.read_text(encoding="utf-8").strip())

        return "\n\n".join(part for part in prompt_parts if part)

    def _validate_model_config(self, config: SceneModelConfig) -> None:
        if not config.base_url or not config.model_name:
            raise ValueError("Scene model configuration is incomplete")
        if not self.api_key:
            raise ValueError("Global model API key is not configured")

    def _normalize_user_id(self, user_id: str | None) -> str:
        return user_id or DEFAULT_USER_ID

    def _build_session_counter(self) -> Iterator[int]:
        max_session_number = 0
        for path in self.history_repository.history_root.glob("*/*/index.json"):
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue

            for entry in payload.get("entries", []):
                session_id = entry.get("session_id")
                if not isinstance(session_id, str) or not session_id.startswith("session-"):
                    continue
                try:
                    max_session_number = max(max_session_number, int(session_id.split("-")[-1]))
                except ValueError:
                    continue

        next_session_number = max_session_number + 1
        while True:
            yield next_session_number
            next_session_number += 1

    def _get_or_restore_session(self, session_id: str, user_id: str | None = None) -> SessionState:
        existing = self._sessions.get(session_id)
        if existing is not None:
            return existing

        normalized_user_id = self._normalize_user_id(user_id)
        history_entry = self.history_repository.find_session(normalized_user_id, session_id)
        if history_entry is None:
            raise KeyError(session_id)

        session = SessionState(scene_id=history_entry.scene_id, user_id=history_entry.user_id)
        self._sessions[session_id] = session
        return session

    def _assert_session_owner(self, session: SessionState, user_id: str) -> None:
        if session.user_id != user_id:
            raise KeyError("Session was not found")

    def _convert_checkpoint_messages(self, messages: list[BaseMessage]) -> list[ChatSessionMessage]:
        converted: list[ChatSessionMessage] = []
        for message in messages:
            if isinstance(message, HumanMessage):
                role = "user"
            elif isinstance(message, AIMessage):
                role = "assistant"
            else:
                continue

            content = message.content if isinstance(message.content, str) else ""
            converted.append(ChatSessionMessage(role=role, content=content))
        return converted

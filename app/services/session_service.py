from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from itertools import count
from pathlib import Path

from app.domain.models import SceneDraft, SceneModelConfig
from app.runtime.agent_factory import AgentSpec, build_deep_agent
from app.runtime.chat_runner import stream_chat_chunks
from app.schemas.chat import (
    ChatMessageResponse,
    ChatSessionResponse,
    ChatSceneSummary,
)
from app.storage.scene_repository import BaseSceneRepository, SceneRepository


@dataclass
class SessionState:
    scene_id: str
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
        self._counter = count(1)
        self._sessions: dict[str, SessionState] = {}
        self.scene_repository = SceneRepository(platform_root)
        self.base_scene_repository = BaseSceneRepository(platform_root)

    def list_scenes(self) -> list[ChatSceneSummary]:
        return [
            ChatSceneSummary(id=scene.id, name=scene.name)
            for scene in self.scene_repository.list_scenes()
        ]

    def create_session(self, scene_id: str) -> ChatSessionResponse:
        self.scene_repository.get_scene(scene_id)
        session_id = f"session-{next(self._counter):03d}"
        self._sessions[session_id] = SessionState(scene_id=scene_id)
        return ChatSessionResponse(session_id=session_id, scene_id=scene_id)

    def get_session(self, session_id: str) -> ChatSessionResponse:
        session = self._sessions[session_id]
        return ChatSessionResponse(session_id=session_id, scene_id=session.scene_id)

    def add_message(self, session_id: str, content: str) -> ChatMessageResponse:
        session = self._sessions[session_id]
        scene = self.scene_repository.get_scene(session.scene_id)
        model_config = self.scene_repository.get_scene_model_config(session.scene_id)
        self._validate_model_config(model_config)
        agent = self.agent_builder(self._build_agent_spec(scene, model_config, session_id))

        session.messages.append(content)
        session.pending_stream_factory = lambda: self.chat_streamer(
            agent,
            content,
            session_id=session_id,
        )
        return ChatMessageResponse(session_id=session_id, status="accepted")

    def stream_session(self, session_id: str):
        session = self._sessions[session_id]
        if session.pending_stream_factory is None:
            return iter(())

        stream_factory = session.pending_stream_factory
        session.pending_stream_factory = None

        def iterator():
            yield from stream_factory()

        return iterator()

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

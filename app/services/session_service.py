from dataclasses import dataclass, field
from itertools import count

from app.runtime.chat_runner import stream_chat_chunks
from app.schemas.chat import (
    ChatMessageResponse,
    ChatSessionResponse,
    ChatSceneSummary,
)


@dataclass
class SessionState:
    scene_id: str
    messages: list[str] = field(default_factory=list)
    pending_chunks: list[str] = field(default_factory=list)


class SessionService:
    def __init__(self):
        self._counter = count(1)
        self._sessions: dict[str, SessionState] = {}

    def list_scenes(self) -> list[ChatSceneSummary]:
        return [ChatSceneSummary(id="sales-assistant", name="Sales Assistant")]

    def create_session(self, scene_id: str) -> ChatSessionResponse:
        session_id = f"session-{next(self._counter):03d}"
        self._sessions[session_id] = SessionState(scene_id=scene_id)
        return ChatSessionResponse(session_id=session_id, scene_id=scene_id)

    def get_session(self, session_id: str) -> ChatSessionResponse:
        session = self._sessions[session_id]
        return ChatSessionResponse(session_id=session_id, scene_id=session.scene_id)

    def add_message(self, session_id: str, content: str) -> ChatMessageResponse:
        session = self._sessions[session_id]
        session.messages.append(content)
        session.pending_chunks = [
            "Analyzing your request. ",
            f"Scene {session.scene_id} is active. ",
            f"Suggested follow-up: {content}",
        ]
        return ChatMessageResponse(session_id=session_id, status="accepted")

    def stream_session(self, session_id: str):
        session = self._sessions[session_id]
        return stream_chat_chunks(session.pending_chunks)

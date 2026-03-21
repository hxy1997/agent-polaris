from app.schemas.chat import ChatSessionResponse, ChatSceneSummary


class SessionService:
    def list_scenes(self) -> list[ChatSceneSummary]:
        return [ChatSceneSummary(id="sales-assistant", name="Sales Assistant")]

    def create_session(self, scene_id: str) -> ChatSessionResponse:
        return ChatSessionResponse(session_id="session-001", scene_id=scene_id)

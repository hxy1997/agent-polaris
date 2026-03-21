from fastapi import APIRouter

from app.schemas.chat import ChatSceneSummary, ChatSessionResponse, CreateSessionRequest
from app.services.session_service import SessionService

router = APIRouter(prefix="/api/chat", tags=["chat"])
session_service = SessionService()


@router.get("/scenes", response_model=list[ChatSceneSummary])
def list_scenes() -> list[ChatSceneSummary]:
    return session_service.list_scenes()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
def create_session(payload: CreateSessionRequest) -> ChatSessionResponse:
    return session_service.create_session(payload.scene_id)

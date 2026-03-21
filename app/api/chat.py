import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.settings import Settings
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSceneSummary,
    ChatSessionResponse,
    CreateSessionRequest,
)
from app.services.session_service import SessionService

router = APIRouter(prefix="/api/chat", tags=["chat"])
settings = Settings()
session_service = SessionService(
    platform_root=settings.platform_root,
    session_root=settings.session_root,
    api_key=settings.model_api_key,
)


@router.get("/scenes", response_model=list[ChatSceneSummary])
def list_scenes() -> list[ChatSceneSummary]:
    return session_service.list_scenes()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
def create_session(payload: CreateSessionRequest) -> ChatSessionResponse:
    return session_service.create_session(payload.scene_id)


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session(session_id: str) -> ChatSessionResponse:
    return session_service.get_session(session_id)


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse, status_code=202)
def add_message(session_id: str, payload: ChatMessageRequest) -> ChatMessageResponse:
    try:
        return session_service.add_message(session_id, payload.content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/sessions/{session_id}/stream")
def stream_session(session_id: str) -> StreamingResponse:
    def event_stream():
        for chunk in session_service.stream_session(session_id):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

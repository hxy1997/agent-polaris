import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.settings import Settings
from app.schemas.chat import (
    ChatHistoryEntryResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSceneSummary,
    ChatSessionMessage,
    ChatSessionMessagesResponse,
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
    return session_service.create_session(payload.scene_id, payload.user_id)


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session(session_id: str) -> ChatSessionResponse:
    try:
        return session_service.get_session(session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Session was not found") from exc


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse, status_code=202)
def add_message(session_id: str, payload: ChatMessageRequest) -> ChatMessageResponse:
    try:
        return session_service.add_message(session_id, payload.content, payload.user_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Session was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/sessions/{session_id}/stream")
def stream_session(session_id: str) -> StreamingResponse:
    try:
        chunks = session_service.stream_session(session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Session was not found") from exc

    def event_stream():
        for chunk in chunks:
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/history", response_model=list[ChatHistoryEntryResponse])
def list_history(scene_id: str, user_id: str | None = None) -> list[ChatHistoryEntryResponse]:
    return session_service.list_history(scene_id, user_id)


@router.get("/sessions/{session_id}/messages", response_model=ChatSessionMessagesResponse)
def get_session_messages(
    session_id: str,
    user_id: str | None = None,
) -> ChatSessionMessagesResponse:
    try:
        return session_service.get_session_messages(session_id, user_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Session was not found") from exc

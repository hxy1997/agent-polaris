from pydantic import BaseModel, Field


class ChatSceneSummary(BaseModel):
    id: str
    name: str
    description: str = ""
    hints: list[str] = Field(default_factory=list)


class CreateSessionRequest(BaseModel):
    scene_id: str
    user_id: str | None = None


class ChatSessionResponse(BaseModel):
    session_id: str
    scene_id: str
    user_id: str | None = None


class ChatMessageRequest(BaseModel):
    content: str
    user_id: str | None = None


class ChatMessageResponse(BaseModel):
    session_id: str
    status: str


class ChatHistoryEntryResponse(BaseModel):
    session_id: str
    scene_id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str


class ChatSessionMessage(BaseModel):
    role: str
    content: str


class ChatSessionMessagesResponse(BaseModel):
    session_id: str
    scene_id: str
    user_id: str
    messages: list[ChatSessionMessage]

from pydantic import BaseModel


class ChatSceneSummary(BaseModel):
    id: str
    name: str


class CreateSessionRequest(BaseModel):
    scene_id: str


class ChatSessionResponse(BaseModel):
    session_id: str
    scene_id: str


class ChatMessageRequest(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    session_id: str
    status: str

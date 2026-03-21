from fastapi.testclient import TestClient

from app.api import chat as chat_api
from app.main import app


def test_create_chat_session_returns_http_200_or_201():
    client = TestClient(app)

    response = client.post("/api/chat/sessions", json={"scene_id": "sales-assistant"})

    assert response.status_code in {200, 201}


def test_list_chat_scenes_returns_http_200():
    client = TestClient(app)

    response = client.get("/api/chat/scenes")

    assert response.status_code == 200


def test_stream_chat_session_emits_event_stream():
    class FakeSessionService:
        def list_scenes(self):
            return []

        def create_session(self, scene_id: str, user_id: str | None = None):
            return type(
                "Session",
                (),
                {"session_id": "session-001", "scene_id": scene_id, "user_id": user_id or "0000"},
            )()

        def get_session(self, session_id: str):
            return type(
                "Session",
                (),
                {"session_id": session_id, "scene_id": "sales-assistant", "user_id": "0000"},
            )()

        def add_message(self, session_id: str, content: str, user_id: str | None = None):
            self.content = content
            return type("Response", (), {"session_id": session_id, "status": "accepted"})()

        def stream_session(self, session_id: str):
            yield "Need a concise follow-up"

        def list_history(self, scene_id: str, user_id: str | None = None):
            return []

        def get_session_messages(self, session_id: str, user_id: str | None = None):
            return type(
                "Messages",
                (),
                {
                    "session_id": session_id,
                    "scene_id": "sales-assistant",
                    "user_id": user_id or "0000",
                    "messages": [],
                },
            )()

    chat_api.session_service = FakeSessionService()
    client = TestClient(app)
    session = client.post("/api/chat/sessions", json={"scene_id": "sales-assistant"}).json()
    message_response = client.post(
        f"/api/chat/sessions/{session['session_id']}/messages",
        json={"content": "Need a concise follow-up"},
    )

    assert message_response.status_code == 202

    with client.stream("GET", f"/api/chat/sessions/{session['session_id']}/stream") as response:
        body = b"".join(response.iter_bytes()).decode("utf-8")

    assert response.status_code == 200
    assert "Need a concise follow-up" in body


def test_add_message_returns_422_when_scene_model_config_is_incomplete():
    class FakeSessionService:
        def list_scenes(self):
            return []

        def create_session(self, scene_id: str, user_id: str | None = None):
            return type(
                "Session",
                (),
                {"session_id": "session-001", "scene_id": scene_id, "user_id": user_id or "0000"},
            )()

        def get_session(self, session_id: str):
            return type(
                "Session",
                (),
                {"session_id": session_id, "scene_id": "sales-assistant", "user_id": "0000"},
            )()

        def add_message(self, session_id: str, content: str, user_id: str | None = None):
            raise ValueError("Scene model configuration is incomplete")

        def stream_session(self, session_id: str):
            return iter(())

        def list_history(self, scene_id: str, user_id: str | None = None):
            return []

        def get_session_messages(self, session_id: str, user_id: str | None = None):
            return type(
                "Messages",
                (),
                {
                    "session_id": session_id,
                    "scene_id": "sales-assistant",
                    "user_id": user_id or "0000",
                    "messages": [],
                },
            )()

    chat_api.session_service = FakeSessionService()
    client = TestClient(app)
    session = client.post("/api/chat/sessions", json={"scene_id": "sales-assistant"}).json()

    response = client.post(
        f"/api/chat/sessions/{session['session_id']}/messages",
        json={"content": "Need a concise follow-up"},
    )

    assert response.status_code == 422
    assert "model configuration" in response.json()["detail"]

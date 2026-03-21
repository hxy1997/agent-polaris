from fastapi.testclient import TestClient

from app.main import app


def test_create_chat_session_returns_http_200_or_201():
    client = TestClient(app)

    response = client.post("/api/chat/sessions", json={"scene_id": "sales-assistant"})

    assert response.status_code in {200, 201}


def test_list_chat_scenes_returns_http_200():
    client = TestClient(app)

    response = client.get("/api/chat/scenes")

    assert response.status_code == 200

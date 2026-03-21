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


def test_stream_chat_session_emits_event_stream():
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

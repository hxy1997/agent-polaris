from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


def test_local_platform_smoke():
    client = TestClient(app)

    scenes_response = client.get("/api/chat/scenes")
    assert scenes_response.status_code == 200

    session_response = client.post("/api/chat/sessions", json={"scene_id": "sales-assistant"})
    assert session_response.status_code == 201
    session_id = session_response.json()["session_id"]

    message_response = client.post(
        f"/api/chat/sessions/{session_id}/messages",
        json={"content": "Prepare a concise follow-up"},
    )
    assert message_response.status_code == 202

    with client.stream("GET", f"/api/chat/sessions/{session_id}/stream") as response:
        body = b"".join(response.iter_bytes()).decode("utf-8")

    assert response.status_code == 200
    assert "Prepare a concise follow-up" in body
    assert Path("frontend/src/App.tsx").exists()

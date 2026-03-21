from fastapi.testclient import TestClient

from app.main import app


def test_list_scenes_returns_http_200():
    client = TestClient(app)

    response = client.get("/api/admin/scenes")

    assert response.status_code == 200


def test_list_base_scenes_returns_http_200():
    client = TestClient(app)

    response = client.get("/api/admin/base-scenes")

    assert response.status_code == 200

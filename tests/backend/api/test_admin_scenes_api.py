from pathlib import Path

from fastapi.testclient import TestClient

from app.api.admin import scenes as admin_scenes_api
from app.main import app
from app.services.scene_service import SceneService


def test_list_scenes_returns_http_200():
    client = TestClient(app)

    response = client.get("/api/admin/scenes")

    assert response.status_code == 200


def test_list_base_scenes_returns_http_200():
    client = TestClient(app)

    response = client.get("/api/admin/base-scenes")

    assert response.status_code == 200


def test_get_scene_returns_runtime_model_config(tmp_path: Path, monkeypatch):
    platform_root = tmp_path / "platform"
    scene_dir = platform_root / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        "\n".join(
            [
                'id = "sales-assistant"',
                'name = "Sales Assistant"',
                'description = "Sales support"',
                'status = "active"',
            ]
        ),
        encoding="utf-8",
    )
    (scene_dir / ".env").write_text(
        "\n".join(
            [
                "POLARIS_MODEL_BASE_URL=https://openrouter.ai/api/v1",
                "POLARIS_MODEL_NAME=openai/gpt-4.1-mini",
            ]
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(admin_scenes_api, "scene_service", SceneService(platform_root))

    client = TestClient(app)
    response = client.get("/api/admin/scenes/sales-assistant")

    assert response.status_code == 200
    assert response.json()["model_name"] == "openai/gpt-4.1-mini"


def test_put_scene_updates_runtime_model_config(tmp_path: Path, monkeypatch):
    platform_root = tmp_path / "platform"
    scene_dir = platform_root / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        "\n".join(
            [
                'id = "sales-assistant"',
                'name = "Sales Assistant"',
                'description = "Sales support"',
                'status = "active"',
            ]
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(admin_scenes_api, "scene_service", SceneService(platform_root))

    client = TestClient(app)
    response = client.put(
        "/api/admin/scenes/sales-assistant",
        json={
            "base_url": "https://api.openai.com/v1",
            "model_name": "gpt-4.1-mini",
        },
    )

    assert response.status_code == 200
    content = (scene_dir / ".env").read_text(encoding="utf-8")
    assert "POLARIS_MODEL_BASE_URL=https://api.openai.com/v1" in content
    assert "POLARIS_MODEL_NAME=gpt-4.1-mini" in content
    assert "POLARIS_MODEL_API_KEY" not in content

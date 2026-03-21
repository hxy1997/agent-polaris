from pathlib import Path

from app.storage.scene_repository import BaseSceneRepository, SceneRepository


def test_scene_repository_reads_scene_metadata(tmp_path: Path):
    scene_dir = tmp_path / "platform" / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        'id = "sales-assistant"\nname = "Sales Assistant"\n',
        encoding="utf-8",
    )

    repo = SceneRepository(tmp_path / "platform")
    scene = repo.get_scene("sales-assistant")

    assert scene.id == "sales-assistant"
    assert scene.name == "Sales Assistant"


def test_base_scene_repository_reads_base_scene_metadata(tmp_path: Path):
    base_scene_dir = tmp_path / "platform" / "base-scenes" / "corp-default"
    base_scene_dir.mkdir(parents=True)
    (base_scene_dir / "base-scene.toml").write_text(
        '\n'.join(
            [
                'id = "corp-default"',
                'name = "Corporate Default"',
                'description = "Shared defaults"',
                'status = "draft"',
                'system_prompt_path = "system.md"',
                'skill_ids = ["summarize"]',
            ]
        ),
        encoding="utf-8",
    )

    repo = BaseSceneRepository(tmp_path / "platform")
    base_scene = repo.get_base_scene("corp-default")

    assert base_scene.id == "corp-default"
    assert base_scene.skill_ids == ["summarize"]


def test_scene_repository_reads_runtime_model_config_from_env_file(tmp_path: Path):
    scene_dir = tmp_path / "platform" / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        '\n'.join(
            [
                'id = "sales-assistant"',
                'name = "Sales Assistant"',
                'description = "Handle sales questions"',
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

    repo = SceneRepository(tmp_path / "platform")
    config = repo.get_scene_model_config("sales-assistant")

    assert config.base_url == "https://openrouter.ai/api/v1"
    assert config.model_name == "openai/gpt-4.1-mini"


def test_scene_repository_persists_runtime_model_config_to_env_file(tmp_path: Path):
    scene_dir = tmp_path / "platform" / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        'id = "sales-assistant"\nname = "Sales Assistant"\n',
        encoding="utf-8",
    )

    repo = SceneRepository(tmp_path / "platform")
    repo.save_scene_model_config(
        "sales-assistant",
        {
            "base_url": "https://api.openai.com/v1",
            "model_name": "gpt-4.1-mini",
        },
    )

    content = (scene_dir / ".env").read_text(encoding="utf-8")
    assert "POLARIS_MODEL_BASE_URL=https://api.openai.com/v1" in content
    assert "POLARIS_MODEL_NAME=gpt-4.1-mini" in content

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

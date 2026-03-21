from pathlib import Path

from app.bootstrap.runtime_initializer import ensure_platform_initialized


def test_platform_initializer_copies_base_scene_templates(tmp_path: Path):
    platform_root = tmp_path / "platform"

    ensure_platform_initialized(platform_root)

    base_scene_dir = platform_root / "base-scenes" / "corp-default"
    assert (base_scene_dir / "base-scene.toml").exists()
    assert (base_scene_dir / "system.md").exists()


def test_platform_initializer_does_not_overwrite_existing_base_scene(tmp_path: Path):
    platform_root = tmp_path / "platform"
    base_scene_dir = platform_root / "base-scenes" / "corp-default"
    base_scene_dir.mkdir(parents=True)
    custom_prompt = "Keep my local edits."
    (base_scene_dir / "base-scene.toml").write_text(
        'id = "corp-default"\nname = "Custom"\n',
        encoding="utf-8",
    )
    (base_scene_dir / "system.md").write_text(custom_prompt, encoding="utf-8")

    ensure_platform_initialized(platform_root)

    assert (base_scene_dir / "system.md").read_text(encoding="utf-8") == custom_prompt

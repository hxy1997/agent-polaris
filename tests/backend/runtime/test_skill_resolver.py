from pathlib import Path

from app.runtime.skill_resolver import resolve_skill_paths


def test_resolve_skill_paths_uses_scene_override_for_same_named_skill(tmp_path: Path):
    base_root = tmp_path / "platform" / "base-scene" / "skills"
    scene_root = tmp_path / "platform" / "scenes" / "sales-assistant" / "skills"
    base_unique = base_root / "base-only"
    overridden_base = base_root / "shared-skill"
    scene_override = scene_root / "shared-skill"
    scene_unique = scene_root / "scene-only"
    base_unique.mkdir(parents=True)
    overridden_base.mkdir(parents=True)
    scene_override.mkdir(parents=True)
    scene_unique.mkdir(parents=True)

    result = resolve_skill_paths(
        base_skill_root=base_root,
        scene_skill_root=scene_root,
    )

    assert result == [base_unique, scene_unique, scene_override]

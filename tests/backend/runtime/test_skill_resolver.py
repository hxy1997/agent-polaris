from pathlib import Path

from app.runtime.skill_resolver import resolve_skill_paths


def test_resolve_skill_paths_preserves_base_then_scene_precedence(tmp_path: Path):
    base = tmp_path / "platform" / "skills" / "base-skill" / "artifact"
    scene = tmp_path / "platform" / "skills" / "scene-skill" / "artifact"
    base.mkdir(parents=True)
    scene.mkdir(parents=True)

    result = resolve_skill_paths(
        skill_root=tmp_path / "platform" / "skills",
        base_skill_ids=["base-skill"],
        scene_skill_ids=["scene-skill"],
    )

    assert result == [base, scene]

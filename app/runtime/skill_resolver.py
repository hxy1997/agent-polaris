from pathlib import Path


def resolve_skill_paths(
    skill_root: Path,
    base_skill_ids: list[str],
    scene_skill_ids: list[str],
) -> list[Path]:
    ordered_ids = [*base_skill_ids, *scene_skill_ids]
    return [skill_root / skill_id / "artifact" for skill_id in ordered_ids]

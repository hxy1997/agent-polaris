from pathlib import Path


def resolve_skill_paths(
    *,
    base_skill_root: Path,
    scene_skill_root: Path,
) -> list[Path]:
    result: list[Path] = []
    base_dirs = {
        path.name: path
        for path in sorted(base_skill_root.iterdir())
        if base_skill_root.exists() and path.is_dir()
    } if base_skill_root.exists() else {}
    scene_dirs = {
        path.name: path
        for path in sorted(scene_skill_root.iterdir())
        if scene_skill_root.exists() and path.is_dir()
    } if scene_skill_root.exists() else {}

    for skill_id in sorted(base_dirs):
        if skill_id not in scene_dirs:
            result.append(base_dirs[skill_id])

    for skill_id in sorted(scene_dirs):
        result.append(scene_dirs[skill_id])

    return result

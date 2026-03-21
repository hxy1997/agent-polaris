from __future__ import annotations

from pathlib import Path
import shutil


def ensure_platform_initialized(platform_root: Path) -> None:
    platform_root.mkdir(parents=True, exist_ok=True)
    _ensure_base_scenes_initialized(platform_root)


def _ensure_base_scenes_initialized(platform_root: Path) -> None:
    template_root = Path(__file__).resolve().parent / "templates" / "base_scenes"
    target_root = platform_root / "base-scenes"
    target_root.mkdir(parents=True, exist_ok=True)

    if not template_root.exists():
        return

    for source_dir in sorted(path for path in template_root.iterdir() if path.is_dir()):
        target_dir = target_root / source_dir.name
        if target_dir.exists():
            continue
        shutil.copytree(source_dir, target_dir)

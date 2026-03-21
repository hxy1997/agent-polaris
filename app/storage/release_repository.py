import json
from pathlib import Path


class ReleaseRepository:
    def __init__(self, platform_root: Path):
        self.platform_root = platform_root

    def next_version(self, scene_id: str) -> str:
        release_root = self.platform_root / "releases" / scene_id
        if not release_root.exists():
            return "v0001"

        versions = sorted(
            path.name
            for path in release_root.iterdir()
            if path.is_dir() and path.name.startswith("v")
        )
        if not versions:
            return "v0001"

        next_number = int(versions[-1][1:]) + 1
        return f"v{next_number:04d}"

    def write_snapshot(self, scene_id: str, version: str, snapshot: dict) -> Path:
        release_dir = self.platform_root / "releases" / scene_id / version
        release_dir.mkdir(parents=True, exist_ok=True)
        snapshot_path = release_dir / "snapshot.json"
        snapshot_path.write_text(json.dumps(snapshot), encoding="utf-8")
        return snapshot_path

    def write_current(self, scene_id: str, version: str) -> Path:
        current_path = self.platform_root / "releases" / scene_id / "current.json"
        current_path.parent.mkdir(parents=True, exist_ok=True)
        current_path.write_text(json.dumps({"version": version}), encoding="utf-8")
        return current_path

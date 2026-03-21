import json
from pathlib import Path

from app.storage.release_repository import ReleaseRepository


class ReleaseService:
    def __init__(self, platform_root: Path, workspace_root: Path):
        self.platform_root = platform_root
        self.workspace_root = workspace_root
        self.release_repository = ReleaseRepository(platform_root)

    def publish_scene(self, scene_id: str) -> str:
        version = self.release_repository.next_version(scene_id)
        self.release_repository.write_snapshot(scene_id, version, {})
        self.release_repository.write_current(scene_id, version)
        return version

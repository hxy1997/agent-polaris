from pathlib import Path

from app.domain.models import BaseScene, SceneDraft
from app.storage.file_store import FileStore


class SceneRepository:
    def __init__(self, platform_root: Path, file_store: FileStore | None = None):
        self.platform_root = platform_root
        self.file_store = file_store or FileStore()

    def get_scene(self, scene_id: str) -> SceneDraft:
        scene_dir = self.platform_root / "scenes" / scene_id
        data = self.file_store.read_toml(scene_dir / "scene.toml")
        return SceneDraft(**data)


class BaseSceneRepository:
    def __init__(self, platform_root: Path, file_store: FileStore | None = None):
        self.platform_root = platform_root
        self.file_store = file_store or FileStore()

    def get_base_scene(self, base_scene_id: str) -> BaseScene:
        base_scene_dir = self.platform_root / "base-scenes" / base_scene_id
        data = self.file_store.read_toml(base_scene_dir / "base-scene.toml")
        return BaseScene(**data)

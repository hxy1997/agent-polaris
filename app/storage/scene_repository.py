from pathlib import Path

from app.domain.models import BaseScene, SceneDraft, SceneModelConfig
from app.storage.file_store import FileStore


class SceneRepository:
    def __init__(self, platform_root: Path, file_store: FileStore | None = None):
        self.platform_root = platform_root
        self.file_store = file_store or FileStore()

    def get_scene(self, scene_id: str) -> SceneDraft:
        scene_dir = self.platform_root / "scenes" / scene_id
        data = self.file_store.read_toml(scene_dir / "scene.toml")
        return SceneDraft(**data)

    def list_scenes(self) -> list[SceneDraft]:
        scene_root = self.platform_root / "scenes"
        if not scene_root.exists():
            return []

        scenes: list[SceneDraft] = []
        for scene_dir in sorted(path for path in scene_root.iterdir() if path.is_dir()):
            scenes.append(self.get_scene(scene_dir.name))
        return scenes

    def get_scene_model_config(self, scene_id: str) -> SceneModelConfig:
        scene_dir = self.platform_root / "scenes" / scene_id
        values = self.file_store.read_env(scene_dir / ".env")
        return SceneModelConfig(
            base_url=values.get("POLARIS_MODEL_BASE_URL", ""),
            model_name=values.get("POLARIS_MODEL_NAME", ""),
        )

    def save_scene_model_config(self, scene_id: str, config: SceneModelConfig | dict[str, str]) -> SceneModelConfig:
        scene_dir = self.platform_root / "scenes" / scene_id
        validated = SceneModelConfig.model_validate(config)
        self.file_store.write_env(
            scene_dir / ".env",
            {
                "POLARIS_MODEL_BASE_URL": validated.base_url,
                "POLARIS_MODEL_NAME": validated.model_name,
            },
        )
        return validated


class BaseSceneRepository:
    def __init__(self, platform_root: Path, file_store: FileStore | None = None):
        self.platform_root = platform_root
        self.file_store = file_store or FileStore()

    def get_base_scene(self, base_scene_id: str) -> BaseScene:
        base_scene_dir = self.platform_root / "base-scenes" / base_scene_id
        data = self.file_store.read_toml(base_scene_dir / "base-scene.toml")
        return BaseScene(**data)

    def list_base_scenes(self) -> list[BaseScene]:
        base_root = self.platform_root / "base-scenes"
        if not base_root.exists():
            return []

        base_scenes: list[BaseScene] = []
        for base_scene_dir in sorted(path for path in base_root.iterdir() if path.is_dir()):
            base_scenes.append(self.get_base_scene(base_scene_dir.name))
        return base_scenes

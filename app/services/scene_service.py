from pathlib import Path

from app.domain.models import SceneModelConfig
from app.schemas.admin import SceneDetail, SceneSummary
from app.storage.scene_repository import BaseSceneRepository, SceneRepository


class SceneService:
    def __init__(self, platform_root: Path):
        self.scene_repository = SceneRepository(platform_root)
        self.base_scene_repository = BaseSceneRepository(platform_root)

    def list_scenes(self) -> list[SceneSummary]:
        return [
            SceneSummary(id=scene.id, name=scene.name)
            for scene in self.scene_repository.list_scenes()
        ]

    def list_base_scenes(self) -> list[SceneSummary]:
        return [
            SceneSummary(id=scene.id, name=scene.name)
            for scene in self.base_scene_repository.list_base_scenes()
        ]

    def get_scene_detail(self, scene_id: str) -> SceneDetail:
        scene = self.scene_repository.get_scene(scene_id)
        config = self.scene_repository.get_scene_model_config(scene_id)
        return SceneDetail(
            id=scene.id,
            name=scene.name,
            base_url=config.base_url,
            model_name=config.model_name,
        )

    def update_scene_detail(self, scene_id: str, config: SceneModelConfig) -> SceneDetail:
        scene = self.scene_repository.get_scene(scene_id)
        saved = self.scene_repository.save_scene_model_config(scene_id, config)
        return SceneDetail(
            id=scene.id,
            name=scene.name,
            base_url=saved.base_url,
            model_name=saved.model_name,
        )

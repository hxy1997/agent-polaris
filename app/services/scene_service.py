from pathlib import Path
import re

from app.domain.models import SceneDraft, SceneModelConfig
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
            description=scene.description,
            base_scene_id=scene.base_scene_id,
            system_prompt=self.scene_repository.get_scene_system_prompt(scene_id),
            base_url=config.base_url,
            model_name=config.model_name,
        )

    def update_scene_detail(self, scene_id: str, config: SceneModelConfig) -> SceneDetail:
        scene = self.scene_repository.get_scene(scene_id)
        saved = self.scene_repository.save_scene_model_config(scene_id, config)
        return SceneDetail(
            id=scene.id,
            name=scene.name,
            description=scene.description,
            base_scene_id=scene.base_scene_id,
            system_prompt=self.scene_repository.get_scene_system_prompt(scene_id),
            base_url=saved.base_url,
            model_name=saved.model_name,
        )

    def create_scene(
        self,
        *,
        name: str | None = None,
        base_scene_id: str | None = None,
    ) -> SceneDetail:
        effective_base_scene_id = base_scene_id or self._default_base_scene_id()
        scene_name = name or self._next_scene_name()
        scene_id = self._next_scene_id(scene_name)
        scene = self.scene_repository.create_scene(
            scene_id=scene_id,
            name=scene_name,
            description="新建业务场景草稿。",
            base_scene_id=effective_base_scene_id,
            system_prompt="Describe the business workflow and desired assistant behavior here.\n",
        )
        return SceneDetail(
            id=scene.id,
            name=scene.name,
            description=scene.description,
            base_scene_id=scene.base_scene_id,
            system_prompt=self.scene_repository.get_scene_system_prompt(scene.id),
            base_url="",
            model_name="",
        )

    def create_scene_with_fields(
        self,
        *,
        name: str,
        scene_id: str,
        base_scene_id: str,
        description: str,
    ) -> SceneDetail:
        self.base_scene_repository.get_base_scene(base_scene_id)
        existing_ids = {scene.id for scene in self.scene_repository.list_scenes()}
        if scene_id in existing_ids:
            raise ValueError("Scene ID already exists")

        scene = self.scene_repository.create_scene(
            scene_id=scene_id,
            name=name,
            description=description,
            base_scene_id=base_scene_id,
            system_prompt="Describe the business workflow and desired assistant behavior here.\n",
        )
        return self.get_scene_detail(scene.id)

    def update_scene_metadata(self, scene_id: str, *, name: str, description: str) -> SceneDetail:
        scene = self.scene_repository.get_scene(scene_id)
        updated_scene = SceneDraft(
            id=scene.id,
            name=name,
            description=description,
            status=scene.status,
            base_scene_id=scene.base_scene_id,
            system_prompt_path=scene.system_prompt_path,
            model_config=scene.model_settings,
            workspace_bindings=scene.workspace_bindings,
            skill_ids=scene.skill_ids,
            hints=scene.hints,
        )
        self.scene_repository.save_scene_metadata(scene_id, updated_scene)
        return self.get_scene_detail(scene_id)

    def update_scene_prompt(self, scene_id: str, system_prompt: str) -> SceneDetail:
        self.scene_repository.get_scene(scene_id)
        self.scene_repository.save_scene_system_prompt(scene_id, system_prompt)
        return self.get_scene_detail(scene_id)

    def _default_base_scene_id(self) -> str | None:
        base_scenes = self.base_scene_repository.list_base_scenes()
        return base_scenes[0].id if base_scenes else None

    def _next_scene_name(self) -> str:
        existing_names = {scene.name for scene in self.scene_repository.list_scenes()}
        index = 1
        while True:
            candidate = f"新建场景 {index}"
            if candidate not in existing_names:
                return candidate
            index += 1

    def _next_scene_id(self, name: str) -> str:
        existing_ids = {scene.id for scene in self.scene_repository.list_scenes()}
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        if not slug:
            slug = "scene"

        candidate = slug
        index = 2
        while candidate in existing_ids:
            candidate = f"{slug}-{index}"
            index += 1
        return candidate

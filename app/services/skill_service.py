from pathlib import Path
import re
from typing import Iterable

from app.schemas.admin import SkillFileResponse, SkillTreeNode, SkillTreeResponse
from app.storage.scene_repository import SceneRepository
from app.storage.skill_repository import SkillNodeRecord, SkillRepository


class SkillService:
    def __init__(self, platform_root: Path):
        self.scene_repository = SceneRepository(platform_root)
        self.skill_repository = SkillRepository(platform_root)

    def get_tree(self, scene_id: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        return SkillTreeResponse(
            nodes=[self._to_skill_tree_node(node) for node in self.skill_repository.list_skill_tree(scene_id)]
        )

    def get_file(self, scene_id: str, source: str, path: str) -> SkillFileResponse:
        self.scene_repository.get_scene(scene_id)
        record = self.skill_repository.read_file(scene_id, source, path)
        return SkillFileResponse.model_validate(record.model_dump())

    def create_skill(self, scene_id: str, skill_id: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        normalized = self._normalize_name(skill_id, allow_nested=False)
        self.skill_repository.create_skill(scene_id, normalized)
        return self.get_tree(scene_id)

    def create_file(self, scene_id: str, parent_path: str, name: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        self.skill_repository.create_file(scene_id, parent_path, self._normalize_name(name))
        return self.get_tree(scene_id)

    def create_directory(self, scene_id: str, parent_path: str, name: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        self.skill_repository.create_directory(scene_id, parent_path, self._normalize_name(name))
        return self.get_tree(scene_id)

    def update_file(self, scene_id: str, path: str, content: str) -> SkillFileResponse:
        self.scene_repository.get_scene(scene_id)
        return SkillFileResponse.model_validate(self.skill_repository.save_file(scene_id, path, content))

    def rename_node(self, scene_id: str, path: str, new_name: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        self.skill_repository.rename_node(scene_id, path, self._normalize_name(new_name))
        return self.get_tree(scene_id)

    def delete_node(self, scene_id: str, path: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        self.skill_repository.delete_node(scene_id, path)
        return self.get_tree(scene_id)

    def copy_from_base(self, scene_id: str, skill_id: str) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        self.skill_repository.copy_skill_from_base(scene_id, skill_id)
        return self.get_tree(scene_id)

    def upload_skill_directory(
        self,
        scene_id: str,
        folder_name: str,
        files: Iterable[tuple[str, bytes]],
    ) -> SkillTreeResponse:
        self.scene_repository.get_scene(scene_id)
        normalized_folder_name = self._normalize_name(folder_name, allow_nested=False)
        normalized_files = [
            (self._normalize_name(relative_path, allow_nested=True), content)
            for relative_path, content in files
        ]
        self.skill_repository.upload_skill_directory(
            scene_id,
            normalized_folder_name,
            normalized_files,
        )
        return self.get_tree(scene_id)

    def resolve_runtime_skill_paths(self, scene_id: str) -> list[str]:
        self.scene_repository.get_scene(scene_id)
        return [str(path) for path in self.skill_repository.resolve_runtime_skill_paths(scene_id)]

    def _normalize_name(self, value: str, *, allow_nested: bool = False) -> str:
        candidate = value.strip()
        if not candidate:
            raise ValueError("Name is required")

        pattern = r"^[A-Za-z0-9._-]+$" if not allow_nested else r"^[A-Za-z0-9._/-]+$"
        if not re.match(pattern, candidate):
            raise ValueError("Name contains unsupported characters")

        if ".." in candidate or candidate.startswith("/"):
            raise ValueError("Invalid path")

        return candidate

    def _to_skill_tree_node(self, node: SkillNodeRecord) -> SkillTreeNode:
        return SkillTreeNode(
            id=node.id,
            name=node.name,
            path=node.path,
            node_type=node.node_type,
            source=node.source,
            is_read_only=node.is_read_only,
            is_overridden=node.is_overridden,
            is_skill_root=node.is_skill_root,
            children=[self._to_skill_tree_node(child) for child in node.children],
        )

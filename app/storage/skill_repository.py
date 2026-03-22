from __future__ import annotations

from pathlib import Path
import shutil
from typing import Iterable

from pydantic import BaseModel


SKILL_TEMPLATE = """---
name: {skill_id}
description: "Describe what this skill does."
---

# {skill_id}

## Purpose

Describe when to use this skill.

## Instructions

- Replace this template with the real workflow.
"""


class SkillNodeRecord(BaseModel):
    id: str
    name: str
    path: str
    node_type: str
    source: str
    is_read_only: bool
    is_overridden: bool = False
    is_skill_root: bool = False
    children: list["SkillNodeRecord"] = []


class SkillFileRecord(BaseModel):
    path: str
    name: str
    source: str
    content: str
    is_read_only: bool


class SkillRepository:
    def __init__(self, platform_root: Path):
        self.platform_root = platform_root

    @property
    def base_skill_root(self) -> Path:
        return self.platform_root / "base-scene" / "skills"

    def scene_skill_root(self, scene_id: str) -> Path:
        return self.platform_root / "scenes" / scene_id / "skills"

    def list_skill_tree(self, scene_id: str) -> list[SkillNodeRecord]:
        base_dirs = self._list_skill_dirs(self.base_skill_root)
        scene_root = self.scene_skill_root(scene_id)
        scene_dirs = self._list_skill_dirs(scene_root)
        merged_ids = sorted(set(base_dirs) | set(scene_dirs))
        nodes: list[SkillNodeRecord] = []

        for skill_id in merged_ids:
            has_scene_override = skill_id in scene_dirs
            source = "scene" if has_scene_override else "base"
            skill_dir = scene_dirs.get(skill_id) or base_dirs[skill_id]
            nodes.append(
                self._build_tree_node(
                    root=skill_dir,
                    relative_path=skill_id,
                    source=source,
                    is_read_only=source == "base",
                    is_overridden=skill_id in base_dirs and has_scene_override,
                    is_skill_root=True,
                )
            )

        return nodes

    def read_file(self, scene_id: str, source: str, path: str) -> SkillFileRecord:
        file_path = self._resolve_existing_node(scene_id, source, path, expect_file=True)
        return SkillFileRecord(
            path=path,
            name=file_path.name,
            source=source,
            content=file_path.read_text(encoding="utf-8"),
            is_read_only=source == "base",
        )

    def create_skill(self, scene_id: str, skill_id: str) -> SkillNodeRecord:
        root = self.scene_skill_root(scene_id)
        root.mkdir(parents=True, exist_ok=True)
        skill_dir = root / skill_id
        if skill_dir.exists():
            raise ValueError("Skill already exists")

        skill_dir.mkdir(parents=True)
        (skill_dir / "SKILL.md").write_text(SKILL_TEMPLATE.format(skill_id=skill_id), encoding="utf-8")
        return self._build_tree_node(
            root=skill_dir,
            relative_path=skill_id,
            source="scene",
            is_read_only=False,
            is_skill_root=True,
        )

    def create_file(self, scene_id: str, parent_path: str, name: str) -> SkillNodeRecord:
        parent_dir = self._resolve_existing_node(scene_id, "scene", parent_path, expect_directory=True)
        file_path = parent_dir / name
        if file_path.exists():
            raise ValueError("Node already exists")
        file_path.write_text("", encoding="utf-8")
        return self._build_tree_node(
            root=file_path,
            relative_path=self._relative_scene_path(scene_id, file_path),
            source="scene",
            is_read_only=False,
        )

    def create_directory(self, scene_id: str, parent_path: str, name: str) -> SkillNodeRecord:
        parent_dir = self._resolve_existing_node(scene_id, "scene", parent_path, expect_directory=True)
        directory_path = parent_dir / name
        if directory_path.exists():
            raise ValueError("Node already exists")
        directory_path.mkdir(parents=True)
        return self._build_tree_node(
            root=directory_path,
            relative_path=self._relative_scene_path(scene_id, directory_path),
            source="scene",
            is_read_only=False,
        )

    def save_file(self, scene_id: str, path: str, content: str) -> SkillFileRecord:
        file_path = self._resolve_existing_node(scene_id, "scene", path, expect_file=True)
        file_path.write_text(content, encoding="utf-8")
        return self.read_file(scene_id, "scene", path)

    def rename_node(self, scene_id: str, path: str, new_name: str) -> SkillNodeRecord:
        target_path = self._resolve_existing_node(scene_id, "scene", path)
        relative_path = Path(path)
        if len(relative_path.parts) == 1:
            raise ValueError("Top-level skills cannot be renamed")

        destination = target_path.with_name(new_name)
        if destination.exists():
            raise ValueError("Node already exists")
        target_path.rename(destination)
        return self._build_tree_node(
            root=destination,
            relative_path=self._relative_scene_path(scene_id, destination),
            source="scene",
            is_read_only=False,
        )

    def delete_node(self, scene_id: str, path: str) -> None:
        target_path = self._resolve_existing_node(scene_id, "scene", path)
        if target_path.is_dir():
            shutil.rmtree(target_path)
        else:
            target_path.unlink()

    def copy_skill_from_base(self, scene_id: str, skill_id: str) -> SkillNodeRecord:
        base_skill_dir = self._resolve_existing_node(scene_id, "base", skill_id, expect_directory=True)
        scene_skill_dir = self.scene_skill_root(scene_id) / skill_id
        if scene_skill_dir.exists():
            raise ValueError("Scene skill already exists")

        scene_skill_dir.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(base_skill_dir, scene_skill_dir)
        return self._build_tree_node(
            root=scene_skill_dir,
            relative_path=skill_id,
            source="scene",
            is_read_only=False,
            is_overridden=True,
            is_skill_root=True,
        )

    def upload_skill_directory(
        self,
        scene_id: str,
        folder_name: str,
        files: Iterable[tuple[str, bytes]],
    ) -> SkillNodeRecord:
        root = self.scene_skill_root(scene_id)
        root.mkdir(parents=True, exist_ok=True)
        skill_dir = root / folder_name
        if skill_dir.exists():
            raise ValueError("Skill already exists")

        uploaded_files = list(files)
        if not uploaded_files:
            raise ValueError("At least one file is required")

        skill_dir.mkdir(parents=True)
        for relative_path, content in uploaded_files:
            file_path = self._safe_join(skill_dir, relative_path)
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_bytes(content)

        return self._build_tree_node(
            root=skill_dir,
            relative_path=folder_name,
            source="scene",
            is_read_only=False,
            is_skill_root=True,
        )

    def resolve_runtime_skill_paths(self, scene_id: str) -> list[Path]:
        base_dirs = self._list_skill_dirs(self.base_skill_root)
        scene_dirs = self._list_skill_dirs(self.scene_skill_root(scene_id))
        result: list[Path] = []

        for skill_id in sorted(base_dirs):
            if skill_id in scene_dirs:
                continue
            result.append(base_dirs[skill_id])

        for skill_id in sorted(scene_dirs):
            result.append(scene_dirs[skill_id])

        return result

    def _list_skill_dirs(self, root: Path) -> dict[str, Path]:
        if not root.exists():
            return {}
        return {
            path.name: path
            for path in sorted(root.iterdir())
            if path.is_dir()
        }

    def _build_tree_node(
        self,
        *,
        root: Path,
        relative_path: str,
        source: str,
        is_read_only: bool,
        is_overridden: bool = False,
        is_skill_root: bool = False,
    ) -> SkillNodeRecord:
        children: list[SkillNodeRecord] = []
        if root.is_dir():
            for child in sorted(root.iterdir(), key=lambda path: (path.is_file(), path.name.lower())):
                child_relative = self._join_relative_path(relative_path, child.name)
                children.append(
                    self._build_tree_node(
                        root=child,
                        relative_path=child_relative,
                        source=source,
                        is_read_only=is_read_only,
                    )
                )

        return SkillNodeRecord(
            id=f"{source}:{relative_path}",
            name=root.name,
            path=relative_path,
            node_type="directory" if root.is_dir() else "file",
            source=source,
            is_read_only=is_read_only,
            is_overridden=is_overridden,
            is_skill_root=is_skill_root,
            children=children,
        )

    def _resolve_existing_node(
        self,
        scene_id: str,
        source: str,
        path: str,
        *,
        expect_directory: bool = False,
        expect_file: bool = False,
    ) -> Path:
        root = self.base_skill_root if source == "base" else self.scene_skill_root(scene_id)
        candidate = self._safe_join(root, path)
        if not candidate.exists():
            raise FileNotFoundError(path)
        if expect_directory and not candidate.is_dir():
            raise ValueError("Expected a directory")
        if expect_file and not candidate.is_file():
            raise ValueError("Expected a file")
        return candidate

    def _safe_join(self, root: Path, relative_path: str) -> Path:
        candidate = (root / relative_path).resolve()
        resolved_root = root.resolve()
        if candidate == resolved_root:
            return candidate
        if resolved_root not in candidate.parents:
            raise ValueError("Path escapes skill root")
        return candidate

    def _relative_scene_path(self, scene_id: str, path: Path) -> str:
        return path.relative_to(self.scene_skill_root(scene_id)).as_posix()

    def _join_relative_path(self, parent: str, name: str) -> str:
        if not parent:
            return name
        return f"{parent}/{name}"

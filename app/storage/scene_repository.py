from __future__ import annotations

from pathlib import Path

from app.domain.models import BaseScene, SceneDraft, SceneModelConfig
from app.storage.file_store import FileStore


class SceneRepository:
    def __init__(self, platform_root: Path, file_store: FileStore | None = None):
        self.platform_root = platform_root
        self.file_store = file_store or FileStore()

    def get_scene(self, scene_id: str) -> SceneDraft:
        scene_dir = self.platform_root / "scenes" / scene_id
        try:
            data = self.file_store.read_toml(scene_dir / "scene.toml")
        except FileNotFoundError as exc:
            raise KeyError(scene_id) from exc
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

    def get_scene_system_prompt(self, scene_id: str) -> str:
        scene = self.get_scene(scene_id)
        prompt_name = scene.system_prompt_path or "system.md"
        prompt_path = self.platform_root / "scenes" / scene_id / prompt_name
        if not prompt_path.exists():
            return ""

        return prompt_path.read_text(encoding="utf-8")

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

    def create_scene(
        self,
        *,
        scene_id: str,
        name: str,
        description: str = "",
        base_scene_id: str | None = None,
        system_prompt: str = "",
        hints: list[str] | None = None,
    ) -> SceneDraft:
        scene_dir = self.platform_root / "scenes" / scene_id
        scene_dir.mkdir(parents=True, exist_ok=False)

        lines = [
            f'id = "{scene_id}"',
            f'name = "{name}"',
            f'description = "{description}"',
            'status = "draft"',
        ]
        if base_scene_id:
            lines.append(f'base_scene_id = "{base_scene_id}"')
        lines.append('system_prompt_path = "system.md"')
        if hints:
            serialized_hints = ", ".join(f'"{hint}"' for hint in hints)
            lines.append(f"hints = [{serialized_hints}]")

        (scene_dir / "scene.toml").write_text("\n".join(lines) + "\n", encoding="utf-8")
        (scene_dir / "system.md").write_text(system_prompt, encoding="utf-8")
        return self.get_scene(scene_id)

    def save_scene_metadata(self, scene_id: str, scene: SceneDraft) -> SceneDraft:
        scene_dir = self.platform_root / "scenes" / scene_id
        lines = [
            f'id = "{scene.id}"',
            f'name = "{scene.name}"',
            f'description = "{scene.description}"',
            f'status = "{scene.status}"',
        ]
        if scene.base_scene_id:
            lines.append(f'base_scene_id = "{scene.base_scene_id}"')
        if scene.system_prompt_path:
            lines.append(f'system_prompt_path = "{scene.system_prompt_path}"')
        if scene.hints:
            serialized_hints = ", ".join(f'"{hint}"' for hint in scene.hints)
            lines.append(f"hints = [{serialized_hints}]")

        (scene_dir / "scene.toml").write_text("\n".join(lines) + "\n", encoding="utf-8")
        return self.get_scene(scene_id)

    def save_scene_system_prompt(self, scene_id: str, content: str) -> None:
        scene = self.get_scene(scene_id)
        prompt_path = self.platform_root / "scenes" / scene_id / (scene.system_prompt_path or "system.md")
        prompt_path.write_text(content, encoding="utf-8")


class BaseSceneRepository:
    def __init__(self, platform_root: Path, file_store: FileStore | None = None):
        self.platform_root = platform_root
        self.file_store = file_store or FileStore()

    def get_base_scene(self, base_scene_id: str) -> BaseScene:
        base_scene_dir = self.platform_root / "base-scenes" / base_scene_id
        try:
            data = self.file_store.read_toml(base_scene_dir / "base-scene.toml")
        except FileNotFoundError as exc:
            raise KeyError(base_scene_id) from exc
        return BaseScene(**data)

    def list_base_scenes(self) -> list[BaseScene]:
        base_root = self.platform_root / "base-scenes"
        if not base_root.exists():
            return []

        base_scenes: list[BaseScene] = []
        for base_scene_dir in sorted(path for path in base_root.iterdir() if path.is_dir()):
            base_scenes.append(self.get_base_scene(base_scene_dir.name))
        return base_scenes

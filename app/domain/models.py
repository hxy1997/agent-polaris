from pydantic import BaseModel, ConfigDict, Field


class WorkspaceBinding(BaseModel):
    workspace_id: str
    mode: str


class BaseScene(BaseModel):
    id: str
    name: str
    description: str
    status: str
    system_prompt_path: str
    skill_ids: list[str] = Field(default_factory=list)


class SceneDraft(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    description: str = ""
    status: str = "draft"
    base_scene_id: str | None = None
    model_settings: dict[str, object] = Field(default_factory=dict, alias="model_config")
    system_prompt_path: str | None = None
    workspace_bindings: list[WorkspaceBinding] = Field(default_factory=list)
    skill_ids: list[str] = Field(default_factory=list)


class SkillRecord(BaseModel):
    id: str
    name: str
    description: str
    status: str
    artifact_path: str
    risk_level: str
    tags: list[str] = Field(default_factory=list)


class WorkspaceRecord(BaseModel):
    id: str
    name: str
    root_id: str
    relative_path: str
    mode: str
    description: str


class ReleaseSnapshot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    scene_id: str
    version: str
    published_at: str
    base_scene_id: str | None = None
    compiled_system_prompt_path: str
    effective_skill_paths: list[str] = Field(default_factory=list)
    effective_tool_names: list[str] = Field(default_factory=list)
    effective_workspaces: list[str] = Field(default_factory=list)
    model_settings: dict[str, object] = Field(default_factory=dict, alias="model_config")

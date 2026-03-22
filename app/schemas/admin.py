from pydantic import BaseModel


class SceneSummary(BaseModel):
    id: str
    name: str


class BaseSceneSummary(BaseModel):
    id: str
    name: str


class SceneDetail(BaseModel):
    id: str
    name: str
    description: str = ""
    base_scene_id: str | None = None
    system_prompt: str = ""
    base_url: str = ""
    model_name: str = ""


class SceneConfigUpdate(BaseModel):
    base_url: str
    model_name: str


class CreateSceneRequest(BaseModel):
    name: str
    scene_id: str
    base_scene_id: str
    description: str


class SceneMetadataUpdate(BaseModel):
    name: str
    description: str


class ScenePromptUpdate(BaseModel):
    system_prompt: str


class SkillTreeNode(BaseModel):
    id: str
    name: str
    path: str
    node_type: str
    source: str
    is_read_only: bool
    is_overridden: bool = False
    is_skill_root: bool = False
    children: list["SkillTreeNode"] = []


class SkillTreeResponse(BaseModel):
    nodes: list[SkillTreeNode]


class SkillFileResponse(BaseModel):
    path: str
    name: str
    source: str
    content: str
    is_read_only: bool


class CreateSkillRequest(BaseModel):
    skill_id: str


class CreateSkillNodeRequest(BaseModel):
    parent_path: str
    name: str


class CopySkillFromBaseRequest(BaseModel):
    skill_id: str


class UpdateSkillFileRequest(BaseModel):
    path: str
    content: str


class RenameSkillNodeRequest(BaseModel):
    path: str
    new_name: str

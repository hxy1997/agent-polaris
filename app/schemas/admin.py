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

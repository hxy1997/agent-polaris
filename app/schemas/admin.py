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
    base_url: str = ""
    model_name: str = ""


class SceneConfigUpdate(BaseModel):
    base_url: str
    model_name: str

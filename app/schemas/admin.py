from pydantic import BaseModel


class SceneSummary(BaseModel):
    id: str
    name: str


class BaseSceneSummary(BaseModel):
    id: str
    name: str

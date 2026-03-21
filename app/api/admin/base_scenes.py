from fastapi import APIRouter

from app.schemas.admin import BaseSceneSummary
from app.core.settings import Settings
from app.services.scene_service import SceneService

router = APIRouter(prefix="/api/admin/base-scenes", tags=["admin-base-scenes"])
scene_service = SceneService(Settings().platform_root)


@router.get("", response_model=list[BaseSceneSummary])
def list_base_scenes() -> list[BaseSceneSummary]:
    return [
        BaseSceneSummary(id=scene.id, name=scene.name)
        for scene in scene_service.list_base_scenes()
    ]

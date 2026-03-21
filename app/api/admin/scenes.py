from fastapi import APIRouter

from app.core.settings import Settings
from app.domain.models import SceneModelConfig
from app.schemas.admin import SceneConfigUpdate, SceneDetail, SceneSummary
from app.services.scene_service import SceneService

router = APIRouter(prefix="/api/admin/scenes", tags=["admin-scenes"])
scene_service = SceneService(Settings().platform_root)


@router.get("", response_model=list[SceneSummary])
def list_scenes() -> list[SceneSummary]:
    return scene_service.list_scenes()


@router.get("/{scene_id}", response_model=SceneDetail)
def get_scene(scene_id: str) -> SceneDetail:
    return scene_service.get_scene_detail(scene_id)


@router.put("/{scene_id}", response_model=SceneDetail)
def update_scene(scene_id: str, payload: SceneConfigUpdate) -> SceneDetail:
    return scene_service.update_scene_detail(
        scene_id,
        SceneModelConfig(
            base_url=payload.base_url,
            model_name=payload.model_name,
        ),
    )

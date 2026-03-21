from fastapi import APIRouter, HTTPException

from app.bootstrap.runtime_initializer import ensure_platform_initialized
from app.core.settings import Settings
from app.domain.models import SceneModelConfig
from app.schemas.admin import (
    CreateSceneRequest,
    SceneConfigUpdate,
    SceneDetail,
    SceneMetadataUpdate,
    ScenePromptUpdate,
    SceneSummary,
)
from app.services.scene_service import SceneService

router = APIRouter(prefix="/api/admin/scenes", tags=["admin-scenes"])
settings = Settings()
ensure_platform_initialized(settings.platform_root)
scene_service = SceneService(settings.platform_root)


@router.get("", response_model=list[SceneSummary])
def list_scenes() -> list[SceneSummary]:
    return scene_service.list_scenes()


@router.get("/{scene_id}", response_model=SceneDetail)
def get_scene(scene_id: str) -> SceneDetail:
    return scene_service.get_scene_detail(scene_id)


@router.post("", response_model=SceneDetail, status_code=201)
def create_scene(payload: CreateSceneRequest) -> SceneDetail:
    try:
        return scene_service.create_scene_with_fields(
            name=payload.name,
            scene_id=payload.scene_id,
            base_scene_id=payload.base_scene_id,
            description=payload.description,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.put("/{scene_id}/metadata", response_model=SceneDetail)
def update_scene_metadata(scene_id: str, payload: SceneMetadataUpdate) -> SceneDetail:
    return scene_service.update_scene_metadata(
        scene_id,
        name=payload.name,
        description=payload.description,
    )


@router.put("/{scene_id}/prompt", response_model=SceneDetail)
def update_scene_prompt(scene_id: str, payload: ScenePromptUpdate) -> SceneDetail:
    return scene_service.update_scene_prompt(scene_id, payload.system_prompt)


@router.put("/{scene_id}", response_model=SceneDetail)
def update_scene(scene_id: str, payload: SceneConfigUpdate) -> SceneDetail:
    return scene_service.update_scene_detail(
        scene_id,
        SceneModelConfig(
            base_url=payload.base_url,
            model_name=payload.model_name,
        ),
    )

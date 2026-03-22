from fastapi import APIRouter, HTTPException

from app.bootstrap.runtime_initializer import ensure_platform_initialized
from app.core.settings import Settings
from app.domain.models import SceneModelConfig
from app.schemas.admin import (
    CopySkillFromBaseRequest,
    CreateSkillNodeRequest,
    CreateSkillRequest,
    RenameSkillNodeRequest,
    CreateSceneRequest,
    SceneConfigUpdate,
    SceneDetail,
    SceneMetadataUpdate,
    ScenePromptUpdate,
    SceneSummary,
    SkillFileResponse,
    SkillTreeResponse,
    UpdateSkillFileRequest,
)
from app.services.scene_service import SceneService
from app.services.skill_service import SkillService

router = APIRouter(prefix="/api/admin/scenes", tags=["admin-scenes"])
settings = Settings()
ensure_platform_initialized(settings.platform_root)
scene_service = SceneService(settings.platform_root)
skill_service = SkillService(settings.platform_root)


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


@router.get("/{scene_id}/skills/tree", response_model=SkillTreeResponse)
def get_skill_tree(scene_id: str) -> SkillTreeResponse:
    try:
        return skill_service.get_tree(scene_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc


@router.get("/{scene_id}/skills/file", response_model=SkillFileResponse)
def get_skill_file(scene_id: str, source: str, path: str) -> SkillFileResponse:
    try:
        return skill_service.get_file(scene_id, source, path)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Skill file was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/{scene_id}/skills/skill", response_model=SkillTreeResponse, status_code=201)
def create_skill(scene_id: str, payload: CreateSkillRequest) -> SkillTreeResponse:
    try:
        return skill_service.create_skill(scene_id, payload.skill_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/{scene_id}/skills/file", response_model=SkillTreeResponse, status_code=201)
def create_skill_file(scene_id: str, payload: CreateSkillNodeRequest) -> SkillTreeResponse:
    try:
        return skill_service.create_file(scene_id, payload.parent_path, payload.name)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Skill directory was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/{scene_id}/skills/directory", response_model=SkillTreeResponse, status_code=201)
def create_skill_directory(scene_id: str, payload: CreateSkillNodeRequest) -> SkillTreeResponse:
    try:
        return skill_service.create_directory(scene_id, payload.parent_path, payload.name)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Skill directory was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/{scene_id}/skills/copy-from-base", response_model=SkillTreeResponse, status_code=201)
def copy_skill_from_base(scene_id: str, payload: CopySkillFromBaseRequest) -> SkillTreeResponse:
    try:
        return skill_service.copy_from_base(scene_id, payload.skill_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Base skill was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.put("/{scene_id}/skills/file", response_model=SkillFileResponse)
def update_skill_file(scene_id: str, payload: UpdateSkillFileRequest) -> SkillFileResponse:
    try:
        return skill_service.update_file(scene_id, payload.path, payload.content)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Skill file was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.put("/{scene_id}/skills/rename", response_model=SkillTreeResponse)
def rename_skill_node(scene_id: str, payload: RenameSkillNodeRequest) -> SkillTreeResponse:
    try:
        return skill_service.rename_node(scene_id, payload.path, payload.new_name)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Skill node was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.delete("/{scene_id}/skills/node", response_model=SkillTreeResponse)
def delete_skill_node(scene_id: str, path: str) -> SkillTreeResponse:
    try:
        return skill_service.delete_node(scene_id, path)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Scene was not found") from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Skill node was not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

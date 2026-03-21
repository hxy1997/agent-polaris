from fastapi import APIRouter

from app.schemas.admin import BaseSceneSummary

router = APIRouter(prefix="/api/admin/base-scenes", tags=["admin-base-scenes"])


@router.get("", response_model=list[BaseSceneSummary])
def list_base_scenes() -> list[BaseSceneSummary]:
    return [BaseSceneSummary(id="corp-default", name="Corporate Default")]

from fastapi import APIRouter

from app.schemas.admin import SceneSummary

router = APIRouter(prefix="/api/admin/scenes", tags=["admin-scenes"])


@router.get("", response_model=list[SceneSummary])
def list_scenes() -> list[SceneSummary]:
    return [SceneSummary(id="sales-assistant", name="Sales Assistant")]

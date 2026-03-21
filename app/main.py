from fastapi import FastAPI

from app.api.admin.base_scenes import router as admin_base_scenes_router
from app.api.admin.scenes import router as admin_scenes_router
from app.api.chat import router as chat_router


app = FastAPI(title="Polaris")
app.include_router(admin_scenes_router)
app.include_router(admin_base_scenes_router)
app.include_router(chat_router)

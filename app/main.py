from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.admin.base_scenes import router as admin_base_scenes_router
from app.api.admin.scenes import router as admin_scenes_router
from app.api.chat import router as chat_router
from app.bootstrap.runtime_initializer import ensure_platform_initialized
from app.core.settings import Settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_platform_initialized(Settings().platform_root)
    yield


app = FastAPI(title="Polaris", lifespan=lifespan)
app.include_router(admin_scenes_router)
app.include_router(admin_base_scenes_router)
app.include_router(chat_router)

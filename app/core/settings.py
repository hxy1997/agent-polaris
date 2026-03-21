from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    platform_root: Path = Path("platform")
    workspace_root: Path = Path("workspaces")
    session_root: Path = Path("sessions")

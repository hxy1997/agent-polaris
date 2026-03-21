from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    platform_root: Path = Path("platform")
    workspace_root: Path = Path("workspaces")
    session_root: Path = Path("sessions")
    model_api_key: str = Field(default="", validation_alias="POLARIS_MODEL_API_KEY")

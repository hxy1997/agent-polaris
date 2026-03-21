from app.core.settings import Settings


def test_settings_exposes_default_storage_paths():
    settings = Settings()

    assert settings.platform_root.name == "platform"
    assert settings.workspace_root.name == "workspaces"

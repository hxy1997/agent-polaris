from app.core.settings import Settings


def test_settings_exposes_default_storage_paths():
    settings = Settings()

    assert settings.platform_root.name == "platform"
    assert settings.workspace_root.name == "workspaces"


def test_settings_reads_global_model_api_key(monkeypatch):
    monkeypatch.setenv("POLARIS_MODEL_API_KEY", "sk-global")

    settings = Settings()

    assert settings.model_api_key == "sk-global"

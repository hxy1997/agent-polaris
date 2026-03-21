from pathlib import Path

from app.domain.models import SceneModelConfig
from app.runtime.agent_factory import AgentSpec, build_agent_config, build_deep_agent


def test_build_agent_config_uses_compiled_prompt_and_skill_paths():
    spec = AgentSpec(
        system_prompt="compiled prompt",
        skill_paths=["/tmp/base", "/tmp/scene"],
        tool_names=["execute"],
    )

    result = build_agent_config(spec)

    assert result["system_prompt"] == "compiled prompt"
    assert result["skills"] == ["/tmp/base", "/tmp/scene"]


def test_build_deep_agent_uses_scene_env_model_settings(monkeypatch, tmp_path: Path):
    captured: dict[str, object] = {}

    class DummyChatOpenAI:
        def __init__(self, **kwargs):
            captured["model_kwargs"] = kwargs

    def fake_create_deep_agent(**kwargs):
        captured.update(kwargs)
        return "compiled-agent"

    monkeypatch.setattr("app.runtime.agent_factory.ChatOpenAI", DummyChatOpenAI)
    monkeypatch.setattr("app.runtime.agent_factory.create_deep_agent", fake_create_deep_agent)

    spec = AgentSpec(
        system_prompt="compiled prompt",
        skill_paths=[str(tmp_path / "skills" / "sales")],
        tool_names=["execute"],
        runtime_mode="local-dev",
        runtime_root=tmp_path / "sessions" / "session-001",
        model_config=SceneModelConfig(
            base_url="https://openrouter.ai/api/v1",
            model_name="openai/gpt-4.1-mini",
        ),
        api_key="sk-global",
    )

    result = build_deep_agent(spec)

    assert result == "compiled-agent"
    assert captured["system_prompt"] == "compiled prompt"
    assert captured["skills"] == [str(tmp_path / "skills" / "sales")]
    assert captured["model_kwargs"] == {
        "api_key": "sk-global",
        "base_url": "https://openrouter.ai/api/v1",
        "model": "openai/gpt-4.1-mini",
        "streaming": True,
    }
    assert captured["backend"].__class__.__name__ == "LocalShellBackend"

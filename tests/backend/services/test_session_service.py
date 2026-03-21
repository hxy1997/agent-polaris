from pathlib import Path

import pytest

from app.services.session_service import SessionService


def test_session_service_requires_complete_scene_model_config(tmp_path: Path):
    platform_root = tmp_path / "platform"
    scene_dir = platform_root / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        "\n".join(
            [
                'id = "sales-assistant"',
                'name = "Sales Assistant"',
                'description = "Sales support"',
                'status = "active"',
            ]
        ),
        encoding="utf-8",
    )

    service = SessionService(platform_root=platform_root, session_root=tmp_path / "sessions")
    session = service.create_session("sales-assistant")

    with pytest.raises(ValueError, match="model configuration"):
        service.add_message(session.session_id, "Draft a follow-up")


def test_session_service_streams_through_built_deep_agent(tmp_path: Path):
    platform_root = tmp_path / "platform"
    scene_dir = platform_root / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text(
        "\n".join(
            [
                'id = "sales-assistant"',
                'name = "Sales Assistant"',
                'description = "Sales support"',
                'status = "active"',
                'system_prompt_path = "system.md"',
            ]
        ),
        encoding="utf-8",
    )
    (scene_dir / "system.md").write_text("Help the sales team.", encoding="utf-8")
    (scene_dir / ".env").write_text(
        "\n".join(
            [
                "POLARIS_MODEL_BASE_URL=https://api.openai.com/v1",
                "POLARIS_MODEL_NAME=gpt-4.1-mini",
            ]
        ),
        encoding="utf-8",
    )

    captured: dict[str, object] = {}

    def fake_agent_builder(spec):
        captured["spec"] = spec
        return "deep-agent"

    def fake_chat_streamer(agent, user_message: str, *, session_id: str):
        captured["agent"] = agent
        captured["user_message"] = user_message
        captured["session_id"] = session_id
        yield "hello"
        yield " world"

    service = SessionService(
        platform_root=platform_root,
        session_root=tmp_path / "sessions",
        agent_builder=fake_agent_builder,
        chat_streamer=fake_chat_streamer,
        api_key="sk-global",
    )
    session = service.create_session("sales-assistant")

    response = service.add_message(session.session_id, "Draft a follow-up")
    chunks = list(service.stream_session(session.session_id))

    assert response.status == "accepted"
    assert chunks == ["hello", " world"]
    assert captured["agent"] == "deep-agent"
    assert captured["user_message"] == "Draft a follow-up"
    assert captured["session_id"] == session.session_id
    assert captured["spec"].model_config.model_name == "gpt-4.1-mini"
    assert captured["spec"].api_key == "sk-global"

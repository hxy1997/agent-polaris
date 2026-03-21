from app.runtime.agent_factory import AgentSpec, build_agent_config


def test_build_agent_config_uses_compiled_prompt_and_skill_paths():
    spec = AgentSpec(
        system_prompt="compiled prompt",
        skill_paths=["/tmp/base", "/tmp/scene"],
        tool_names=["execute"],
    )

    result = build_agent_config(spec)

    assert result["system_prompt"] == "compiled prompt"
    assert result["skills"] == ["/tmp/base", "/tmp/scene"]

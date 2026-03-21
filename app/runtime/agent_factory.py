from dataclasses import dataclass


@dataclass
class AgentSpec:
    system_prompt: str
    skill_paths: list[str]
    tool_names: list[str]
    runtime_mode: str = "local-dev"


def build_agent_config(spec: AgentSpec) -> dict:
    return {
        "system_prompt": spec.system_prompt,
        "runtime_mode": spec.runtime_mode,
        "skills": spec.skill_paths,
        "tools": spec.tool_names,
    }

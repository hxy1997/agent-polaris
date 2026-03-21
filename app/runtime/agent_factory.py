from dataclasses import dataclass
from pathlib import Path

from deepagents import create_deep_agent
from deepagents.backends import LocalShellBackend
from langchain_openai import ChatOpenAI

from app.domain.models import SceneModelConfig


@dataclass
class AgentSpec:
    system_prompt: str
    skill_paths: list[str]
    tool_names: list[str]
    runtime_mode: str = "local-dev"
    runtime_root: Path | None = None
    model_config: SceneModelConfig | None = None
    api_key: str = ""


def build_agent_config(spec: AgentSpec) -> dict:
    return {
        "system_prompt": spec.system_prompt,
        "runtime_mode": spec.runtime_mode,
        "skills": spec.skill_paths,
        "tools": spec.tool_names,
    }


def build_deep_agent(spec: AgentSpec):
    if spec.model_config is None:
        raise ValueError("Scene model configuration is required")
    if not spec.model_config.base_url or not spec.model_config.model_name:
        raise ValueError("Scene model configuration is incomplete")
    if not spec.api_key:
        raise ValueError("Global model API key is not configured")

    model = ChatOpenAI(
        model=spec.model_config.model_name,
        api_key=spec.api_key,
        base_url=spec.model_config.base_url,
        streaming=True,
    )
    backend = LocalShellBackend(
        root_dir=spec.runtime_root,
        virtual_mode=True,
        env={},
        inherit_env=False,
    )
    return create_deep_agent(
        model=model,
        tools=[],
        system_prompt=spec.system_prompt,
        skills=spec.skill_paths,
        backend=backend,
    )

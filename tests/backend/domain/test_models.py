from app.domain.models import (
    BaseScene,
    ReleaseSnapshot,
    SceneModelConfig,
    SceneDraft,
    SkillRecord,
    WorkspaceBinding,
    WorkspaceRecord,
)


def test_scene_draft_tracks_base_scene_and_workspace_bindings():
    draft = SceneDraft(
        id="sales-assistant",
        name="Sales Assistant",
        base_scene_id="corp-default",
        workspace_bindings=[WorkspaceBinding(workspace_id="sales-materials", mode="read")],
    )

    assert draft.base_scene_id == "corp-default"
    assert draft.workspace_bindings[0].workspace_id == "sales-materials"


def test_control_plane_records_preserve_core_identifiers():
    base_scene = BaseScene(
        id="corp-default",
        name="Corporate Default",
        description="Shared defaults",
        status="draft",
        system_prompt_path="prompts/base.md",
        skill_ids=["summarize"],
    )
    skill = SkillRecord(
        id="summarize",
        name="Summarize",
        description="Summarize business documents",
        status="active",
        artifact_path="skills/summarize/artifact",
        risk_level="low",
        tags=["writing"],
    )
    workspace = WorkspaceRecord(
        id="sales-materials",
        name="Sales Materials",
        root_id="default",
        relative_path="sales/files",
        mode="read",
        description="Reference workspace",
    )
    release = ReleaseSnapshot(
        scene_id="sales-assistant",
        version="v0001",
        published_at="2026-03-21T00:00:00Z",
        base_scene_id="corp-default",
        compiled_system_prompt_path="releases/sales-assistant/v0001/system_prompt.txt",
        effective_skill_paths=["skills/summarize/artifact"],
        effective_tool_names=["execute"],
        effective_workspaces=["sales-materials"],
        model_config={"model": "gpt-5"},
    )

    assert base_scene.skill_ids == ["summarize"]
    assert skill.artifact_path.endswith("artifact")
    assert workspace.relative_path == "sales/files"
    assert release.version == "v0001"


def test_scene_model_config_tracks_runtime_connection_fields():
    config = SceneModelConfig(
        base_url="https://openrouter.ai/api/v1",
        model_name="openai/gpt-4.1-mini",
    )

    assert config.base_url.startswith("https://")
    assert config.model_name == "openai/gpt-4.1-mini"

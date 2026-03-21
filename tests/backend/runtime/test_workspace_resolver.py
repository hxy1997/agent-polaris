from pathlib import Path

from app.domain.models import WorkspaceBinding
from app.runtime.workspace_resolver import build_runtime_workspace_map


def test_build_runtime_workspace_map_returns_bound_workspace_paths(tmp_path: Path):
    workspace_root = tmp_path / "workspaces"
    target = workspace_root / "sales-materials" / "files"
    target.mkdir(parents=True)

    result = build_runtime_workspace_map(
        workspace_root=workspace_root,
        bindings=[WorkspaceBinding(workspace_id="sales-materials", mode="read")],
    )

    assert result["sales-materials"].root_path == target

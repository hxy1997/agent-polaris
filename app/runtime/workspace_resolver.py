from pathlib import Path

from pydantic import BaseModel

from app.domain.models import WorkspaceBinding


class RuntimeWorkspace(BaseModel):
    workspace_id: str
    root_path: Path
    mode: str


def build_runtime_workspace_map(
    workspace_root: Path,
    bindings: list[WorkspaceBinding],
) -> dict[str, RuntimeWorkspace]:
    result: dict[str, RuntimeWorkspace] = {}
    for binding in bindings:
        result[binding.workspace_id] = RuntimeWorkspace(
            workspace_id=binding.workspace_id,
            root_path=workspace_root / binding.workspace_id / "files",
            mode=binding.mode,
        )

    return result

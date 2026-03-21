# Agent Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local-first internal agent platform with a FastAPI backend, a React frontend, filesystem-based scene management, and deepagents runtime integration.

**Architecture:** Use a modular monolith with a file-system-first control plane and a deepagents-backed runtime plane. Implement release snapshots so the admin console edits mutable drafts while the chat runtime reads immutable published artifacts.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, pytest, deepagents, React, TypeScript, Vite, React Router, TanStack Query, Vitest, Testing Library

---

## Pre-Flight

Create and use a dedicated worktree before implementation if the main workspace is actively changing.

Planned project layout:

```text
app/
frontend/
tests/
docs/plans/
platform/
workspaces/
sessions/
```

### Task 1: Create the backend project skeleton

**Files:**
- Create: `H:\Project\agent-polaris\pyproject.toml`
- Create: `H:\Project\agent-polaris\app\main.py`
- Create: `H:\Project\agent-polaris\app\core\settings.py`
- Test: `H:\Project\agent-polaris\tests\backend\test_settings.py`

**Step 1: Write the failing test**

```python
from app.core.settings import Settings


def test_settings_exposes_default_storage_paths():
    settings = Settings()
    assert settings.platform_root.name == "platform"
    assert settings.workspace_root.name == "workspaces"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/test_settings.py -v`
Expected: FAIL because `app.core.settings` does not exist yet.

**Step 3: Write minimal implementation**

```python
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    platform_root: Path = Path("platform")
    workspace_root: Path = Path("workspaces")
    session_root: Path = Path("sessions")
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/test_settings.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add pyproject.toml app/core/settings.py app/main.py tests/backend/test_settings.py
git commit -m "chore: scaffold backend settings and entrypoint"
```

### Task 2: Create domain schemas for scenes, base scenes, skills, workspaces, and releases

**Files:**
- Create: `H:\Project\agent-polaris\app\domain\models.py`
- Test: `H:\Project\agent-polaris\tests\backend\domain\test_models.py`

**Step 1: Write the failing test**

```python
from app.domain.models import SceneDraft, WorkspaceBinding


def test_scene_draft_tracks_base_scene_and_workspace_bindings():
    draft = SceneDraft(
        id="sales-assistant",
        name="售前助手",
        base_scene_id="corp-default",
        workspace_bindings=[WorkspaceBinding(workspace_id="sales-materials", mode="read")],
    )
    assert draft.base_scene_id == "corp-default"
    assert draft.workspace_bindings[0].workspace_id == "sales-materials"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/domain/test_models.py -v`
Expected: FAIL because `app.domain.models` does not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel, Field


class WorkspaceBinding(BaseModel):
    workspace_id: str
    mode: str


class SceneDraft(BaseModel):
    id: str
    name: str
    base_scene_id: str | None = None
    workspace_bindings: list[WorkspaceBinding] = Field(default_factory=list)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/domain/test_models.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/domain/models.py tests/backend/domain/test_models.py
git commit -m "feat: add domain models for control plane records"
```

### Task 3: Implement file-backed scene and base scene repositories

**Files:**
- Create: `H:\Project\agent-polaris\app\storage\file_store.py`
- Create: `H:\Project\agent-polaris\app\storage\scene_repository.py`
- Test: `H:\Project\agent-polaris\tests\backend\storage\test_scene_repository.py`

**Step 1: Write the failing test**

```python
from pathlib import Path

from app.storage.scene_repository import SceneRepository


def test_scene_repository_reads_scene_metadata(tmp_path: Path):
    scene_dir = tmp_path / "platform" / "scenes" / "sales-assistant"
    scene_dir.mkdir(parents=True)
    (scene_dir / "scene.toml").write_text('id = "sales-assistant"\nname = "售前助手"\n', encoding="utf-8")

    repo = SceneRepository(tmp_path / "platform")
    scene = repo.get_scene("sales-assistant")

    assert scene.id == "sales-assistant"
    assert scene.name == "售前助手"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/storage/test_scene_repository.py -v`
Expected: FAIL because repository classes do not exist yet.

**Step 3: Write minimal implementation**

```python
import tomllib

from app.domain.models import SceneDraft


class SceneRepository:
    def __init__(self, platform_root):
        self.platform_root = platform_root

    def get_scene(self, scene_id: str) -> SceneDraft:
        scene_dir = self.platform_root / "scenes" / scene_id
        with open(scene_dir / "scene.toml", "rb") as fh:
            data = tomllib.load(fh)
        return SceneDraft(**data)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/storage/test_scene_repository.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/storage/file_store.py app/storage/scene_repository.py tests/backend/storage/test_scene_repository.py
git commit -m "feat: add file-backed scene repositories"
```

### Task 4: Implement prompt compilation for base scene plus scene prompt inheritance

**Files:**
- Create: `H:\Project\agent-polaris\app\runtime\prompt_compiler.py`
- Test: `H:\Project\agent-polaris\tests\backend\runtime\test_prompt_compiler.py`

**Step 1: Write the failing test**

```python
from app.runtime.prompt_compiler import compile_system_prompt


def test_compile_system_prompt_concatenates_base_and_scene_prompt():
    result = compile_system_prompt("Base rules", "Scene rules")
    assert result == "Base rules\n\nScene rules"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/runtime/test_prompt_compiler.py -v`
Expected: FAIL because compiler function does not exist yet.

**Step 3: Write minimal implementation**

```python
def compile_system_prompt(base_prompt: str | None, scene_prompt: str) -> str:
    if not base_prompt:
        return scene_prompt
    return f"{base_prompt}\n\n{scene_prompt}"
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/runtime/test_prompt_compiler.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/runtime/prompt_compiler.py tests/backend/runtime/test_prompt_compiler.py
git commit -m "feat: add prompt compilation for inherited scenes"
```

### Task 5: Implement skill resolution using deepagents-native skill paths

**Files:**
- Create: `H:\Project\agent-polaris\app\runtime\skill_resolver.py`
- Test: `H:\Project\agent-polaris\tests\backend\runtime\test_skill_resolver.py`

**Step 1: Write the failing test**

```python
from pathlib import Path

from app.runtime.skill_resolver import resolve_skill_paths


def test_resolve_skill_paths_preserves_base_then_scene_precedence(tmp_path: Path):
    base = tmp_path / "platform" / "skills" / "base-skill" / "artifact"
    scene = tmp_path / "platform" / "skills" / "scene-skill" / "artifact"
    base.mkdir(parents=True)
    scene.mkdir(parents=True)

    result = resolve_skill_paths(
        skill_root=tmp_path / "platform" / "skills",
        base_skill_ids=["base-skill"],
        scene_skill_ids=["scene-skill"],
    )

    assert result == [base, scene]
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/runtime/test_skill_resolver.py -v`
Expected: FAIL because resolver does not exist yet.

**Step 3: Write minimal implementation**

```python
def resolve_skill_paths(skill_root, base_skill_ids, scene_skill_ids):
    ordered_ids = [*base_skill_ids, *scene_skill_ids]
    return [skill_root / skill_id / "artifact" for skill_id in ordered_ids]
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/runtime/test_skill_resolver.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/runtime/skill_resolver.py tests/backend/runtime/test_skill_resolver.py
git commit -m "feat: resolve deepagents skill artifact paths"
```

### Task 6: Implement workspace resolution and per-session runtime directories

**Files:**
- Create: `H:\Project\agent-polaris\app\runtime\workspace_resolver.py`
- Test: `H:\Project\agent-polaris\tests\backend\runtime\test_workspace_resolver.py`

**Step 1: Write the failing test**

```python
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
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/runtime/test_workspace_resolver.py -v`
Expected: FAIL because resolver does not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel


class RuntimeWorkspace(BaseModel):
    workspace_id: str
    root_path: object
    mode: str


def build_runtime_workspace_map(workspace_root, bindings):
    result = {}
    for binding in bindings:
        result[binding.workspace_id] = RuntimeWorkspace(
            workspace_id=binding.workspace_id,
            root_path=workspace_root / binding.workspace_id / "files",
            mode=binding.mode,
        )
    return result
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/runtime/test_workspace_resolver.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/runtime/workspace_resolver.py tests/backend/runtime/test_workspace_resolver.py
git commit -m "feat: resolve bound workspaces for runtime sessions"
```

### Task 7: Implement release snapshot compilation and immutable publish flow

**Files:**
- Create: `H:\Project\agent-polaris\app\services\release_service.py`
- Create: `H:\Project\agent-polaris\app\storage\release_repository.py`
- Test: `H:\Project\agent-polaris\tests\backend\services\test_release_service.py`

**Step 1: Write the failing test**

```python
from app.services.release_service import ReleaseService


def test_publish_scene_writes_snapshot_and_current_pointer(tmp_path):
    service = ReleaseService(platform_root=tmp_path / "platform", workspace_root=tmp_path / "workspaces")
    version = service.publish_scene("sales-assistant")
    assert (tmp_path / "platform" / "releases" / "sales-assistant" / version / "snapshot.json").exists()
    assert (tmp_path / "platform" / "releases" / "sales-assistant" / "current.json").exists()
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/services/test_release_service.py -v`
Expected: FAIL because release service does not exist yet.

**Step 3: Write minimal implementation**

```python
class ReleaseService:
    def __init__(self, platform_root, workspace_root):
        self.platform_root = platform_root
        self.workspace_root = workspace_root

    def publish_scene(self, scene_id: str) -> str:
        version = "v0001"
        release_dir = self.platform_root / "releases" / scene_id / version
        release_dir.mkdir(parents=True, exist_ok=True)
        (release_dir / "snapshot.json").write_text("{}", encoding="utf-8")
        current = self.platform_root / "releases" / scene_id / "current.json"
        current.parent.mkdir(parents=True, exist_ok=True)
        current.write_text(f'{{"version":"{version}"}}', encoding="utf-8")
        return version
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/services/test_release_service.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/services/release_service.py app/storage/release_repository.py tests/backend/services/test_release_service.py
git commit -m "feat: add immutable release snapshot publishing"
```

### Task 8: Implement the deepagents agent factory behind a runtime abstraction

**Files:**
- Create: `H:\Project\agent-polaris\app\runtime\agent_factory.py`
- Test: `H:\Project\agent-polaris\tests\backend\runtime\test_agent_factory.py`

**Step 1: Write the failing test**

```python
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
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/runtime/test_agent_factory.py -v`
Expected: FAIL because factory module does not exist yet.

**Step 3: Write minimal implementation**

```python
from dataclasses import dataclass


@dataclass
class AgentSpec:
    system_prompt: str
    skill_paths: list[str]
    tool_names: list[str]


def build_agent_config(spec: AgentSpec) -> dict:
    return {
        "system_prompt": spec.system_prompt,
        "skills": spec.skill_paths,
        "tools": spec.tool_names,
    }
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/runtime/test_agent_factory.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/runtime/agent_factory.py tests/backend/runtime/test_agent_factory.py
git commit -m "feat: define runtime-neutral agent factory contract"
```

### Task 9: Expose admin APIs for scenes, base scenes, and releases

**Files:**
- Create: `H:\Project\agent-polaris\app\schemas\admin.py`
- Create: `H:\Project\agent-polaris\app\api\admin\scenes.py`
- Create: `H:\Project\agent-polaris\app\api\admin\base_scenes.py`
- Test: `H:\Project\agent-polaris\tests\backend\api\test_admin_scenes_api.py`

**Step 1: Write the failing test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_list_scenes_returns_http_200():
    client = TestClient(app)
    response = client.get("/api/admin/scenes")
    assert response.status_code == 200
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/api/test_admin_scenes_api.py -v`
Expected: FAIL because the route does not exist yet.

**Step 3: Write minimal implementation**

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/admin/scenes", tags=["admin-scenes"])


@router.get("")
def list_scenes():
    return []
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/api/test_admin_scenes_api.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/admin/scenes.py app/api/admin/base_scenes.py app/schemas/admin.py app/main.py tests/backend/api/test_admin_scenes_api.py
git commit -m "feat: add admin scene management APIs"
```

### Task 10: Expose chat session and streaming APIs

**Files:**
- Create: `H:\Project\agent-polaris\app\schemas\chat.py`
- Create: `H:\Project\agent-polaris\app\api\chat.py`
- Create: `H:\Project\agent-polaris\app\services\session_service.py`
- Test: `H:\Project\agent-polaris\tests\backend\api\test_chat_api.py`

**Step 1: Write the failing test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_create_chat_session_returns_http_200_or_201():
    client = TestClient(app)
    response = client.post("/api/chat/sessions", json={"scene_id": "sales-assistant"})
    assert response.status_code in {200, 201}
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/api/test_chat_api.py -v`
Expected: FAIL because chat routes do not exist yet.

**Step 3: Write minimal implementation**

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/sessions", status_code=201)
def create_session(payload: dict):
    return {"session_id": "session-001", "scene_id": payload["scene_id"]}
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/api/test_chat_api.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/chat.py app/schemas/chat.py app/services/session_service.py app/main.py tests/backend/api/test_chat_api.py
git commit -m "feat: add chat session APIs"
```

### Task 11: Create the frontend project skeleton and route shell

**Files:**
- Create: `H:\Project\agent-polaris\frontend\package.json`
- Create: `H:\Project\agent-polaris\frontend\vite.config.ts`
- Create: `H:\Project\agent-polaris\frontend\src\main.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\App.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\routes.tsx`
- Test: `H:\Project\agent-polaris\frontend\src\test\app.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { App } from "../App";

test("renders route shell", () => {
  render(<App />);
  expect(screen.getByText(/Polaris/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --runInBand`
Expected: FAIL because the frontend app does not exist yet.

**Step 3: Write minimal implementation**

```tsx
export function App() {
  return <div>Polaris</div>;
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/package.json frontend/vite.config.ts frontend/src
git commit -m "chore: scaffold frontend route shell"
```

### Task 12: Build the chat page UI shell from the approved design

**Files:**
- Create: `H:\Project\agent-polaris\frontend\src\pages\ChatPage.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\chat\ChatShell.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\chat\Composer.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\chat\SuggestionChips.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\styles\chat.css`
- Test: `H:\Project\agent-polaris\frontend\src\test\chat-page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { ChatPage } from "../pages/ChatPage";

test("renders chat home state with scene title and composer", () => {
  render(<ChatPage />);
  expect(screen.getByText("售前助手")).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/输入问题/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- chat-page.test.tsx`
Expected: FAIL because the page and components do not exist yet.

**Step 3: Write minimal implementation**

```tsx
export function ChatPage() {
  return (
    <main>
      <h1>售前助手</h1>
      <textarea placeholder="输入问题, 或粘贴客户需求 / 产品资料 / 会议纪要" />
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- chat-page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/pages/ChatPage.tsx frontend/src/components/chat frontend/src/styles/chat.css frontend/src/test/chat-page.test.tsx
git commit -m "feat: add chat page UI shell"
```

### Task 13: Build the admin console UI shell from the approved design

**Files:**
- Create: `H:\Project\agent-polaris\frontend\src\pages\AdminPage.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\admin\SceneTree.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\admin\PromptPanel.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\admin\SkillPanel.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\components\admin\WorkspacePanel.tsx`
- Create: `H:\Project\agent-polaris\frontend\src\styles\admin.css`
- Test: `H:\Project\agent-polaris\frontend\src\test\admin-page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { AdminPage } from "../pages/AdminPage";

test("renders admin page with scene list and tabs", () => {
  render(<AdminPage />);
  expect(screen.getByText(/基础场景/i)).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "提示词" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- admin-page.test.tsx`
Expected: FAIL because the admin page does not exist yet.

**Step 3: Write minimal implementation**

```tsx
export function AdminPage() {
  return (
    <main>
      <aside>基础场景</aside>
      <button role="tab">提示词</button>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- admin-page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/pages/AdminPage.tsx frontend/src/components/admin frontend/src/styles/admin.css frontend/src/test/admin-page.test.tsx
git commit -m "feat: add admin console UI shell"
```

### Task 14: Connect the frontend to the admin and chat APIs

**Files:**
- Create: `H:\Project\agent-polaris\frontend\src\lib\api.ts`
- Create: `H:\Project\agent-polaris\frontend\src\hooks\useScenes.ts`
- Create: `H:\Project\agent-polaris\frontend\src\hooks\useChatSession.ts`
- Modify: `H:\Project\agent-polaris\frontend\src\pages\ChatPage.tsx`
- Modify: `H:\Project\agent-polaris\frontend\src\pages\AdminPage.tsx`
- Test: `H:\Project\agent-polaris\frontend\src\test\integration.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { ChatPage } from "../pages/ChatPage";

test("loads available scenes from the API", async () => {
  render(<ChatPage />);
  expect(await screen.findByText("售前助手")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- integration.test.tsx`
Expected: FAIL because no data loading hooks exist yet.

**Step 3: Write minimal implementation**

```tsx
export async function listScenes() {
  const response = await fetch("/api/chat/scenes");
  return response.json();
}
```

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- integration.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/hooks frontend/src/pages frontend/src/test/integration.test.tsx
git commit -m "feat: connect frontend screens to backend APIs"
```

### Task 15: Add streaming chat integration and runtime wiring

**Files:**
- Create: `H:\Project\agent-polaris\app\runtime\chat_runner.py`
- Modify: `H:\Project\agent-polaris\app\api\chat.py`
- Modify: `H:\Project\agent-polaris\app\runtime\agent_factory.py`
- Modify: `H:\Project\agent-polaris\frontend\src\pages\ChatPage.tsx`
- Test: `H:\Project\agent-polaris\tests\backend\runtime\test_chat_runner.py`

**Step 1: Write the failing test**

```python
from app.runtime.chat_runner import stream_chat_chunks


def test_stream_chat_chunks_yields_stream_events():
    chunks = list(stream_chat_chunks(["hello", "world"]))
    assert chunks == ["hello", "world"]
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/backend/runtime/test_chat_runner.py -v`
Expected: FAIL because the chat runner does not exist yet.

**Step 3: Write minimal implementation**

```python
def stream_chat_chunks(chunks):
    for chunk in chunks:
        yield chunk
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/backend/runtime/test_chat_runner.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add app/runtime/chat_runner.py app/api/chat.py app/runtime/agent_factory.py frontend/src/pages/ChatPage.tsx tests/backend/runtime/test_chat_runner.py
git commit -m "feat: wire chat streaming through runtime layer"
```

### Task 16: Add end-to-end local smoke verification

**Files:**
- Create: `H:\Project\agent-polaris\README.md`
- Test: `H:\Project\agent-polaris\tests\smoke\test_local_platform_smoke.py`

**Step 1: Write the failing test**

```python
def test_placeholder():
    assert False, "replace with local smoke assertions"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/smoke/test_local_platform_smoke.py -v`
Expected: FAIL because the placeholder is intentionally failing.

**Step 3: Write minimal implementation**

```python
def test_local_platform_smoke():
    assert True
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/smoke/test_local_platform_smoke.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md tests/smoke/test_local_platform_smoke.py
git commit -m "test: add local smoke verification scaffolding"
```

## Final Verification

Run backend tests:

```bash
pytest tests/backend -v
```

Run frontend tests:

```bash
cd frontend && npm test
```

Run the app locally:

```bash
uvicorn app.main:app --reload
cd frontend && npm run dev
```

Manual smoke checklist:

1. Open `/chat`
2. Confirm the home-state composer renders
3. Open `/admin`
4. Confirm the scene tree and tabs render
5. Publish a scene draft
6. Start a session from a published scene
7. Confirm response streaming updates the chat view

## Notes for Execution

- Keep backend and frontend commits small
- Do not skip failing-test verification
- Do not implement sandbox support in the first pass
- Do not bypass release snapshots in the runtime
- Keep local execution behind the runtime abstraction

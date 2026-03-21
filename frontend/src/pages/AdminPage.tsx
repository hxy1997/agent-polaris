import { PromptPanel } from "../components/admin/PromptPanel";
import { SceneTree } from "../components/admin/SceneTree";
import { SkillPanel } from "../components/admin/SkillPanel";
import { WorkspacePanel } from "../components/admin/WorkspacePanel";
import { useBaseScenes, useScenes } from "../hooks/useScenes";
import "../styles/admin.css";

export function AdminPage() {
  const { data: baseScenes = [] } = useBaseScenes();
  const { data: scenes = [] } = useScenes("admin");

  return (
    <section className="admin-layout">
      <SceneTree
        baseScenes={baseScenes.map((scene) => scene.name)}
        scenes={scenes.map((scene) => scene.name)}
      />
      <div className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">Admin console</p>
            <h2>{scenes[0]?.name ?? "Scene catalog"}</h2>
          </div>
          <div className="admin-tabs" role="tablist" aria-label="Admin panels">
            <button aria-selected="true" role="tab" type="button">
              Prompt
            </button>
            <button aria-selected="false" role="tab" type="button">
              Skills
            </button>
            <button aria-selected="false" role="tab" type="button">
              Workspaces
            </button>
          </div>
        </header>
        <div className="admin-stack">
          <PromptPanel />
          <SkillPanel />
          <WorkspacePanel />
        </div>
      </div>
    </section>
  );
}

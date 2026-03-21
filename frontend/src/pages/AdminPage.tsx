import { PromptPanel } from "../components/admin/PromptPanel";
import { SceneTree } from "../components/admin/SceneTree";
import { SkillPanel } from "../components/admin/SkillPanel";
import { WorkspacePanel } from "../components/admin/WorkspacePanel";
import "../styles/admin.css";

export function AdminPage() {
  return (
    <section className="admin-layout">
      <SceneTree />
      <div className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">Admin console</p>
            <h2>Sales Assistant</h2>
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

import type { SceneSummary } from "../../lib/api";

type SceneTreeProps = {
  baseScenes: SceneSummary[];
  scenes: SceneSummary[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
};

export function SceneTree({
  baseScenes,
  scenes,
  selectedSceneId,
  onSelectScene
}: SceneTreeProps) {
  return (
    <aside className="scene-tree glass-surface--soft">
      <div className="scene-tree__brand">
        <div className="scene-tree__brand-icon">
          <span aria-hidden="true" className="material-symbols-outlined">
            account_tree
          </span>
        </div>
        <div>
          <h2>Polaris Admin</h2>
          <p>Console</p>
        </div>
      </div>
      <section>
        <div className="scene-tree__section-header">
          <p className="scene-tree__label">基础场景</p>
          <span aria-hidden="true" className="material-symbols-outlined">
            chevron_right
          </span>
        </div>
        <ul>
          {baseScenes.map((scene) => (
            <li key={scene.id}>
              <div className="scene-tree__item scene-tree__item--static">
                <span aria-hidden="true" className="material-symbols-outlined">
                  schema
                </span>
                <span>{scene.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="scene-tree__section-header">
          <p className="scene-tree__label">业务场景</p>
          <span aria-hidden="true" className="material-symbols-outlined">
            expand_more
          </span>
        </div>
        <ul>
          {scenes.map((scene) => (
            <li key={scene.id}>
              <button
                className={`scene-tree__item ${scene.id === selectedSceneId ? "is-selected" : ""}`}
                onClick={() => onSelectScene(scene.id)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  smart_toy
                </span>
                <span>{scene.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <div className="scene-tree__usage admin-glass-tile">
        <p>存储用量</p>
        <div className="scene-tree__usage-bar" aria-hidden="true">
          <div />
        </div>
        <span>已使用 7.2 GB / 10 GB</span>
      </div>
    </aside>
  );
}

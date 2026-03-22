import { NavLink } from "react-router-dom";

import type { SceneSummary } from "../../lib/api";

type SceneTreeProps = {
  baseScenes: SceneSummary[];
  scenes: SceneSummary[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: () => void;
};

export function SceneTree({
  baseScenes,
  scenes,
  selectedSceneId,
  onSelectScene,
  onCreateScene
}: SceneTreeProps) {
  return (
    <aside className="scene-tree glass-surface--soft">
      <section>
        <div className="scene-tree__section-header">
          <p className="scene-tree__label">基础场景</p>
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
          <button
            aria-label="新建场景"
            className="scene-tree__section-action"
            type="button"
            onClick={onCreateScene}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
          </button>
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
      <div className="scene-tree__spacer" />
      <div className="scene-tree__footer">
        <NavLink className={({ isActive }) => `scene-tree__item${isActive ? " is-selected" : ""}`} to="/chat">
          <span aria-hidden="true" className="material-symbols-outlined">
            chat
          </span>
          <span>返回对话</span>
        </NavLink>
      </div>
    </aside>
  );
}

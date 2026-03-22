import { NavLink } from "react-router-dom";

import { PolarisMark } from "../common/PolarisMark";
import { AppIcon } from "../common/AppIcon";
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
    <aside className="scene-tree glass-surface--strong">
      <div className="scene-tree__header">
        <div className="sidebar-brand">
          <PolarisMark className="sidebar-brand__mark" />
          <span className="sidebar-brand__name">Polaris</span>
        </div>
      </div>
      <section>
        <div className="scene-tree__section-header">
          <p className="scene-tree__label">基础场景</p>
        </div>
        <ul>
          {baseScenes.map((scene) => (
            <li key={scene.id}>
              <div className="scene-tree__item scene-tree__item--static">
                <AppIcon name="layers" />
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
            <AppIcon name="plus" />
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
                <AppIcon name="robot" />
                <span>{scene.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <div className="scene-tree__spacer" />
      <div className="scene-tree__footer">
        <NavLink className={({ isActive }) => `scene-tree__item${isActive ? " is-selected" : ""}`} to="/chat">
          <AppIcon name="message" />
          <span>返回对话</span>
        </NavLink>
        <div className="sidebar-account glass-surface">
          <div aria-hidden="true" className="page-avatar">
            P
          </div>
          <div className="sidebar-account__meta">
            <strong>默认用户</strong>
            <span>工号 0000</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

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
    <aside className="scene-tree">
      <section>
        <p className="scene-tree__label">基础场景</p>
        <ul>
          {baseScenes.map((scene) => (
            <li key={scene.id}>{scene.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="scene-tree__label">业务场景</p>
        <ul>
          {scenes.map((scene) => (
            <li key={scene.id}>
              <button
                className={scene.id === selectedSceneId ? "is-selected" : undefined}
                onClick={() => onSelectScene(scene.id)}
                type="button"
              >
                {scene.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

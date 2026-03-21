const baseScenes = ["Corporate Default", "Sales Enablement"];
const scenes = ["Sales Assistant", "Renewal Coach", "Partner QA"];

export function SceneTree() {
  return (
    <aside className="scene-tree">
      <section>
        <p className="scene-tree__label">Base Scenes</p>
        <ul>
          {baseScenes.map((scene) => (
            <li key={scene}>{scene}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="scene-tree__label">Scenes</p>
        <ul>
          {scenes.map((scene) => (
            <li key={scene}>{scene}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

type SceneTreeProps = {
  baseScenes: string[];
  scenes: string[];
};

export function SceneTree({ baseScenes, scenes }: SceneTreeProps) {
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

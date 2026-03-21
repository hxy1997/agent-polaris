const workspaces = [
  { name: "sales-materials", mode: "read" },
  { name: "call-logs", mode: "read" },
  { name: "draft-output", mode: "write" }
];

export function WorkspacePanel() {
  return (
    <section className="admin-panel">
      <header>
        <h3>Workspace bindings</h3>
        <p>Resolve controlled file roots into the runtime session without exposing platform state.</p>
      </header>
      <ul className="workspace-list">
        {workspaces.map((workspace) => (
          <li key={workspace.name}>
            <strong>{workspace.name}</strong>
            <span>{workspace.mode}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

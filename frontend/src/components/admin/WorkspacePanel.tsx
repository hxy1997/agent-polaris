const workspaces = [
  { name: "销售资料", mode: "只读" },
  { name: "通话记录", mode: "只读" },
  { name: "草稿输出", mode: "写入" }
];

export function WorkspacePanel() {
  return (
    <section className="admin-panel">
      <header>
        <h3>工作区绑定</h3>
        <p>把受控的文件目录映射进运行时会话，同时不暴露平台内部状态。</p>
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

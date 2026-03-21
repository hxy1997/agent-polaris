export function PromptPanel() {
  return (
    <section className="admin-panel">
      <header>
        <h3>Prompt composition</h3>
        <p>Layer base instructions with scene-specific operating guidance.</p>
      </header>
      <div className="admin-panel__editor">
        <div>
          <span>Base prompt</span>
          <p>Shared company policy, brand voice, and response format.</p>
        </div>
        <div>
          <span>Scene prompt</span>
          <p>Sales-specific behavior, discovery prompts, and output tone.</p>
        </div>
      </div>
    </section>
  );
}

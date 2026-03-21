type PromptPanelProps = {
  baseUrl: string;
  modelName: string;
  onBaseUrlChange: (value: string) => void;
  onModelNameChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function PromptPanel({
  baseUrl,
  modelName,
  onBaseUrlChange,
  onModelNameChange,
  onSave,
  isSaving
}: PromptPanelProps) {
  return (
    <section className="admin-panel">
      <header>
        <h3>模型路由配置</h3>
        <p>将场景专属的模型服务地址和模型名称写入该场景的 .env 文件。</p>
      </header>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>模型服务地址</span>
          <input
            name="base_url"
            onChange={(event) => onBaseUrlChange(event.target.value)}
            placeholder="https://api.openai.com/v1"
            type="url"
            value={baseUrl}
          />
        </label>
        <label className="admin-field">
          <span>模型名称</span>
          <input
            name="model_name"
            onChange={(event) => onModelNameChange(event.target.value)}
            placeholder="gpt-4.1-mini"
            type="text"
            value={modelName}
          />
        </label>
      </div>
      <div className="admin-panel__actions">
        <p className="admin-panel__hint">API Key 由服务端统一管理，不在此页面暴露。</p>
        <button className="admin-button" onClick={onSave} type="button">
          {isSaving ? "保存中..." : "保存模型配置"}
        </button>
      </div>
    </section>
  );
}

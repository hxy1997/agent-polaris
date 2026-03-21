import type { SceneDetail, SceneSummary } from "../../lib/api";

type AdminOverviewPanelProps = {
  baseSceneName: string;
  scene: SceneDetail | SceneSummary | null;
  metadataDescription: string;
  metadataName: string;
  isSavingMetadata: boolean;
  onMetadataDescriptionChange: (value: string) => void;
  onMetadataNameChange: (value: string) => void;
  onSaveMetadata: () => void;
};

const metrics = [
  { label: "总调用量 (24h)", value: "12,482", trend: "12.5%" },
  { label: "平均延迟", value: "1.2s", trend: "Stable" },
  { label: "准确率", value: "98.2%", trend: "98%" },
  { label: "Token 效率", value: "0.85", trend: "per session" }
] as const;

export function AdminOverviewPanel({
  baseSceneName,
  scene,
  metadataDescription,
  metadataName,
  isSavingMetadata,
  onMetadataDescriptionChange,
  onMetadataNameChange,
  onSaveMetadata
}: AdminOverviewPanelProps) {
  const sceneId = scene?.id ?? "未选择场景";
  const sceneName = scene?.name ?? "场景目录";

  return (
    <div className="admin-overview">
      <section className="admin-summary-card glass-surface">
        <div className="admin-summary-card__badge">Active Environment</div>
        <div className="admin-summary-card__icon">
          <span aria-hidden="true" className="material-symbols-outlined">
            smart_toy
          </span>
        </div>
        <div className="admin-summary-card__body">
          <div className="admin-summary-card__title">
            <h2>{sceneName}</h2>
            <span>场景 ID: {sceneId}</span>
          </div>
          <div className="admin-summary-card__meta">
            <div>
              <span>基础场景</span>
              <strong>{baseSceneName}</strong>
            </div>
            <div>
              <span>状态</span>
              <strong className="admin-status">
                <span aria-hidden="true" className="admin-status__dot" />
                编辑中
              </strong>
            </div>
            <div>
              <span>线上版本</span>
              <strong>v2026.03.21.1</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="admin-overview__grid">
        <section className="admin-panel glass-surface">
          <header className="admin-panel__header">
            <div>
              <h3>基础信息</h3>
              <p>编辑场景名称和描述，创建后可立即补齐业务语义。</p>
            </div>
          </header>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>场景名称</span>
              <input value={metadataName} onChange={(event) => onMetadataNameChange(event.target.value)} />
            </label>
            <label className="admin-field">
              <span>场景描述</span>
              <textarea
                rows={5}
                value={metadataDescription}
                onChange={(event) => onMetadataDescriptionChange(event.target.value)}
              />
            </label>
          </div>
          <div className="admin-panel__actions">
            <p className="admin-panel__hint">基础场景当前固定为创建时选择的继承来源：{baseSceneName}</p>
            <button className="admin-button" onClick={onSaveMetadata} type="button">
              {isSavingMetadata ? "保存中..." : "保存基础信息"}
            </button>
          </div>
        </section>

        <section className="admin-panel glass-surface">
          <header className="admin-panel__header">
            <div>
              <h3>草稿智能</h3>
              <p>跟踪当前草稿版本和后续操作入口。</p>
            </div>
            <span aria-hidden="true" className="material-symbols-outlined admin-panel__icon">
              history
            </span>
          </header>
          <div className="admin-overview__stack">
            <div className="admin-glass-tile admin-glass-tile--split">
              <div>
                <p>当前草稿</p>
                <strong>v2026.04.12-rc1</strong>
              </div>
              <span className="admin-chip">UNPUBLISHED</span>
            </div>
            <div className="admin-glass-tile">
              <p>快捷操作</p>
              <div className="admin-overview__actions">
                <button type="button">对比版本</button>
                <button type="button">同步基准</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="admin-panel admin-panel--metrics glass-surface">
        <header className="admin-panel__header">
          <div>
            <h3>交互性能</h3>
            <p>概览最近 24 小时的场景运行表现。</p>
          </div>
        </header>
        <div className="admin-metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="admin-glass-tile admin-metric">
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>{metric.trend}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

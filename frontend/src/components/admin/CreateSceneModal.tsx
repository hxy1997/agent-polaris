import type { SceneSummary } from "../../lib/api";

type CreateSceneForm = {
  name: string;
  scene_id: string;
  base_scene_id: string;
  description: string;
};

type CreateSceneModalProps = {
  baseScenes: SceneSummary[];
  error: string | null;
  form: CreateSceneForm;
  isOpen: boolean;
  isSaving: boolean;
  onChange: (field: keyof CreateSceneForm, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function CreateSceneModal({
  baseScenes,
  error,
  form,
  isOpen,
  isSaving,
  onChange,
  onClose,
  onSubmit
}: CreateSceneModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-modal">
      <button aria-label="关闭新建场景弹窗" className="admin-modal__backdrop" onClick={onClose} type="button" />
      <section className="admin-modal__panel glass-surface" aria-label="新建场景">
        <header className="admin-panel__header">
          <div>
            <h3>新建场景</h3>
            <p>填写场景基础信息后再创建，避免生成无效草稿。</p>
          </div>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>场景名称</span>
            <input value={form.name} onChange={(event) => onChange("name", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>场景 ID</span>
            <input value={form.scene_id} onChange={(event) => onChange("scene_id", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>继承基础场景</span>
            <select value={form.base_scene_id} onChange={(event) => onChange("base_scene_id", event.target.value)}>
              {baseScenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>场景描述</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
            />
          </label>
        </div>
        {error ? <p className="admin-form-error">{error}</p> : null}
        <div className="admin-panel__actions">
          <button className="admin-page__secondary-action" onClick={onClose} type="button">
            取消
          </button>
          <button className="admin-page__primary-action" disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? "保存中..." : "保存场景"}
          </button>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";

import type { SceneDetail, SceneSummary } from "../../lib/api";
import { AppIcon } from "../common/AppIcon";

type AdminWorkspacePanelProps = {
  baseUrl: string;
  isSavingMetadata: boolean;
  isSavingModel: boolean;
  isSavingPrompt: boolean;
  metadataDescription: string;
  metadataName: string;
  modelName: string;
  onBaseUrlChange: (value: string) => void;
  onMetadataDescriptionChange: (value: string) => void;
  onMetadataNameChange: (value: string) => void;
  onModelNameChange: (value: string) => void;
  onSaveMetadata: () => Promise<void>;
  onSaveModel: () => Promise<void>;
  onSavePrompt: () => Promise<void>;
  onSystemPromptChange: (value: string) => void;
  scene: SceneDetail | SceneSummary | null;
  systemPrompt: string;
};

type MetadataSnapshot = {
  name: string;
  description: string;
};

type ModelSnapshot = {
  baseUrl: string;
  modelName: string;
};

function SectionActions({
  editLabel,
  isEditing,
  isSaving,
  onCancel,
  onEdit,
  onSave,
  saveLabel,
  undoLabel
}: {
  editLabel: string;
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  saveLabel: string;
  undoLabel: string;
}) {
  if (!isEditing) {
    return (
      <button
        aria-label={editLabel}
        className="admin-icon-button"
        onClick={onEdit}
        title={editLabel}
        type="button"
      >
        <AppIcon name="edit" />
      </button>
    );
  }

  return (
    <div className="admin-icon-actions">
      <button
        aria-label={undoLabel}
        className="admin-icon-button"
        disabled={isSaving}
        onClick={onCancel}
        title={undoLabel}
        type="button"
      >
        <AppIcon name="undo" />
      </button>
      <button
        aria-label={saveLabel}
        className="admin-icon-button admin-icon-button--primary"
        disabled={isSaving}
        onClick={onSave}
        title={saveLabel}
        type="button"
      >
        <AppIcon name="check" />
      </button>
    </div>
  );
}

export function AdminWorkspacePanel({
  baseUrl,
  isSavingMetadata,
  isSavingModel,
  isSavingPrompt,
  metadataDescription,
  metadataName,
  modelName,
  onBaseUrlChange,
  onMetadataDescriptionChange,
  onMetadataNameChange,
  onModelNameChange,
  onSaveMetadata,
  onSaveModel,
  onSavePrompt,
  onSystemPromptChange,
  scene,
  systemPrompt
}: AdminWorkspacePanelProps) {
  const sceneCode = scene?.id ?? "未选择场景";
  const sceneName = scene?.name ?? "场景目录";
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [savedMetadata, setSavedMetadata] = useState<MetadataSnapshot>({
    name: metadataName,
    description: metadataDescription
  });
  const [savedModel, setSavedModel] = useState<ModelSnapshot>({
    baseUrl,
    modelName
  });
  const [savedPrompt, setSavedPrompt] = useState(systemPrompt);

  useEffect(() => {
    setIsEditingMetadata(false);
    setIsEditingModel(false);
    setIsEditingPrompt(false);
  }, [sceneCode]);

  useEffect(() => {
    if (!isEditingMetadata) {
      setSavedMetadata({
        name: metadataName,
        description: metadataDescription
      });
    }
  }, [isEditingMetadata, metadataDescription, metadataName]);

  useEffect(() => {
    if (!isEditingModel) {
      setSavedModel({
        baseUrl,
        modelName
      });
    }
  }, [baseUrl, isEditingModel, modelName]);

  useEffect(() => {
    if (!isEditingPrompt) {
      setSavedPrompt(systemPrompt);
    }
  }, [isEditingPrompt, systemPrompt]);

  function handleCancelMetadata() {
    onMetadataNameChange(savedMetadata.name);
    onMetadataDescriptionChange(savedMetadata.description);
    setIsEditingMetadata(false);
  }

  function handleCancelModel() {
    onBaseUrlChange(savedModel.baseUrl);
    onModelNameChange(savedModel.modelName);
    setIsEditingModel(false);
  }

  function handleCancelPrompt() {
    onSystemPromptChange(savedPrompt);
    setIsEditingPrompt(false);
  }

  async function handleMetadataSave() {
    await onSaveMetadata();
    setSavedMetadata({
      name: metadataName,
      description: metadataDescription
    });
    setIsEditingMetadata(false);
  }

  async function handleModelSave() {
    await onSaveModel();
    setSavedModel({
      baseUrl,
      modelName
    });
    setIsEditingModel(false);
  }

  async function handlePromptSave() {
    await onSavePrompt();
    setSavedPrompt(systemPrompt);
    setIsEditingPrompt(false);
  }

  return (
    <section className="admin-panel admin-panel--workspace glass-surface">
      <header className="admin-panel__header">
        <div className="admin-workspace__title">
          <h3>{sceneName}</h3>
          <p>{sceneCode}</p>
        </div>
      </header>

      <div className="admin-workbench">
        <aside className="admin-workbench__sidebar">
          <section className="admin-workbench__section">
            <div className="admin-workbench__section-head">
              <h4>基础信息</h4>
              <SectionActions
                editLabel="编辑基础信息"
                isEditing={isEditingMetadata}
                isSaving={isSavingMetadata}
                onCancel={handleCancelMetadata}
                onEdit={() => setIsEditingMetadata(true)}
                onSave={() => {
                  void handleMetadataSave();
                }}
                saveLabel="保存基础信息"
                undoLabel="撤销基础信息编辑"
              />
            </div>
            {isEditingMetadata ? (
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>场景名称</span>
                  <input value={metadataName} onChange={(event) => onMetadataNameChange(event.target.value)} />
                </label>
                <label className="admin-field">
                  <span>场景描述</span>
                  <textarea
                    rows={4}
                    value={metadataDescription}
                    onChange={(event) => onMetadataDescriptionChange(event.target.value)}
                  />
                </label>
              </div>
            ) : (
              <dl className="admin-readonly-grid">
                <div className="admin-readonly-field">
                  <dt>场景名称</dt>
                  <dd>{metadataName || "未设置"}</dd>
                </div>
                <div className="admin-readonly-field admin-readonly-field--multiline">
                  <dt>场景描述</dt>
                  <dd>{metadataDescription || "未设置"}</dd>
                </div>
              </dl>
            )}
          </section>

          <section className="admin-workbench__section">
            <div className="admin-workbench__section-head">
              <h4>模型配置</h4>
              <SectionActions
                editLabel="编辑模型配置"
                isEditing={isEditingModel}
                isSaving={isSavingModel}
                onCancel={handleCancelModel}
                onEdit={() => setIsEditingModel(true)}
                onSave={() => {
                  void handleModelSave();
                }}
                saveLabel="保存模型配置"
                undoLabel="撤销模型配置编辑"
              />
            </div>
            {isEditingModel ? (
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
            ) : (
              <dl className="admin-readonly-grid">
                <div className="admin-readonly-field admin-readonly-field--multiline">
                  <dt>模型服务地址</dt>
                  <dd>{baseUrl || "未设置"}</dd>
                </div>
                <div className="admin-readonly-field">
                  <dt>模型名称</dt>
                  <dd>{modelName || "未设置"}</dd>
                </div>
              </dl>
            )}
          </section>
        </aside>

        <section className="admin-workbench__editor">
          <div className="admin-workbench__section-head admin-workbench__section-head--editor">
            <h4>系统提示词</h4>
            <SectionActions
              editLabel="编辑系统提示词"
              isEditing={isEditingPrompt}
              isSaving={isSavingPrompt}
              onCancel={handleCancelPrompt}
              onEdit={() => setIsEditingPrompt(true)}
              onSave={() => {
                void handlePromptSave();
              }}
              saveLabel="保存系统提示词"
              undoLabel="撤销系统提示词编辑"
            />
          </div>
          <div className="admin-workspace__prompt">
            {isEditingPrompt ? (
              <div className="admin-workspace__prompt-surface admin-workspace__prompt-surface--editing">
                <textarea
                  aria-label="系统提示词"
                  value={systemPrompt}
                  onChange={(event) => onSystemPromptChange(event.target.value)}
                />
              </div>
            ) : (
              <div className="admin-workspace__prompt-surface">
                <pre className="admin-workspace__prompt-content">{systemPrompt || "暂未填写系统提示词"}</pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

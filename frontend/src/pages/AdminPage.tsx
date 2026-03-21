import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { AdminOverviewPanel } from "../components/admin/AdminOverviewPanel";
import { CreateSceneModal } from "../components/admin/CreateSceneModal";
import { PromptPanel } from "../components/admin/PromptPanel";
import { SceneTree } from "../components/admin/SceneTree";
import { SkillPanel } from "../components/admin/SkillPanel";
import { WorkspacePanel } from "../components/admin/WorkspacePanel";
import {
  useBaseScenes,
  useCreateScene,
  useSceneDetail,
  useScenes,
  useUpdateSceneDetail,
  useUpdateSceneMetadata,
  useUpdateScenePrompt
} from "../hooks/useScenes";
import "../styles/admin.css";

type AdminTab = "overview" | "model" | "prompt" | "skills" | "workspace" | "release";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "概览" },
  { id: "model", label: "模型" },
  { id: "prompt", label: "提示词" },
  { id: "skills", label: "Skills" },
  { id: "workspace", label: "工作空间" },
  { id: "release", label: "发布" }
];

type CreateSceneForm = {
  name: string;
  scene_id: string;
  base_scene_id: string;
  description: string;
};

function slugifySceneId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminPage() {
  const { data: baseScenes = [] } = useBaseScenes();
  const { data: scenes = [] } = useScenes("admin");
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const { data: sceneDetail } = useSceneDetail(selectedSceneId);
  const updateSceneDetail = useUpdateSceneDetail(selectedSceneId);
  const updateSceneMetadata = useUpdateSceneMetadata(selectedSceneId);
  const updateScenePrompt = useUpdateScenePrompt(selectedSceneId);
  const createScene = useCreateScene();
  const [baseUrl, setBaseUrl] = useState("");
  const [modelName, setModelName] = useState("");
  const [metadataName, setMetadataName] = useState("");
  const [metadataDescription, setMetadataDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateSceneForm>({
    name: "",
    scene_id: "",
    base_scene_id: "",
    description: ""
  });

  useEffect(() => {
    if (!selectedSceneId && scenes[0]) {
      setSelectedSceneId(scenes[0].id);
    }
  }, [scenes, selectedSceneId]);

  useEffect(() => {
    if (!sceneDetail) {
      return;
    }

    setBaseUrl(sceneDetail.base_url);
    setModelName(sceneDetail.model_name);
    setMetadataName(sceneDetail.name);
    setMetadataDescription(sceneDetail.description);
    setSystemPrompt(sceneDetail.system_prompt);
  }, [sceneDetail]);

  useEffect(() => {
    if (!baseScenes[0] || createForm.base_scene_id) {
      return;
    }

    setCreateForm((current) => ({
      ...current,
      base_scene_id: baseScenes[0].id
    }));
  }, [baseScenes, createForm.base_scene_id]);

  async function handleSaveModelConfig() {
    if (!selectedSceneId) {
      return;
    }

    await updateSceneDetail.mutateAsync({
      base_url: baseUrl,
      model_name: modelName
    });
  }

  async function handleSaveMetadata() {
    if (!selectedSceneId) {
      return;
    }

    await updateSceneMetadata.mutateAsync({
      description: metadataDescription,
      name: metadataName
    });
  }

  async function handleSavePrompt() {
    if (!selectedSceneId) {
      return;
    }

    await updateScenePrompt.mutateAsync({
      system_prompt: systemPrompt
    });
  }

  async function handleCreateScene() {
    if (!createForm.name.trim() || !createForm.scene_id.trim() || !createForm.description.trim()) {
      setCreateError("请填写完整的场景名称、场景 ID 和场景描述");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(createForm.scene_id)) {
      setCreateError("场景 ID 只允许小写字母、数字和连字符");
      return;
    }

    try {
      const createdScene = await createScene.mutateAsync(createForm);
      setSelectedSceneId(createdScene.id);
      setActiveTab("overview");
      setIsCreateModalOpen(false);
      setCreateError(null);
      setCreateForm({
        name: "",
        scene_id: "",
        base_scene_id: baseScenes[0]?.id ?? "",
        description: ""
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "创建场景失败");
    }
  }

  const activeScene = sceneDetail ?? scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0] ?? null;
  const baseSceneName =
    baseScenes.find((scene) => scene.id === sceneDetail?.base_scene_id)?.name ??
    baseScenes[0]?.name ??
    "corp-default";

  return (
    <section className="admin-page">
      <header className="admin-page__header glass-surface--strong">
        <div className="admin-page__header-brand">
          <span className="admin-page__brand-name">Polaris Admin</span>
          <label className="admin-page__search">
            <span aria-hidden="true" className="material-symbols-outlined">
              search
            </span>
            <input placeholder="Search Scene" type="text" />
          </label>
        </div>
        <nav className="admin-page__mode-nav" aria-label="模式导航">
          <NavLink className={({ isActive }) => (isActive ? "is-active" : undefined)} to="/chat">
            对话模式
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "is-active" : undefined)} to="/admin">
            管理后台
          </NavLink>
        </nav>
        <div className="admin-page__header-actions">
          <button
            className="admin-page__secondary-action"
            disabled={createScene.isPending}
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              add
            </span>
            新建场景
          </button>
          <button className="admin-page__primary-action" type="button">
            发布
          </button>
          <div className="admin-page__divider" aria-hidden="true" />
          <button className="admin-page__icon-button" type="button">
            <span aria-hidden="true" className="material-symbols-outlined">
              notifications
            </span>
            <span className="visually-hidden">通知</span>
          </button>
          <button className="admin-page__icon-button" type="button">
            <span aria-hidden="true" className="material-symbols-outlined">
              help
            </span>
            <span className="visually-hidden">帮助</span>
          </button>
          <div aria-hidden="true" className="page-avatar">
            A
          </div>
        </div>
      </header>

      <CreateSceneModal
        baseScenes={baseScenes}
        error={createError}
        form={createForm}
        isOpen={isCreateModalOpen}
        isSaving={createScene.isPending}
        onChange={(field, value) => {
          setCreateForm((current) => {
            const next = { ...current, [field]: value };
            if (field === "name" && !current.scene_id) {
              next.scene_id = slugifySceneId(value);
            }
            return next;
          });
          setCreateError(null);
        }}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateError(null);
        }}
        onSubmit={() => {
          void handleCreateScene();
        }}
      />

      <div className="admin-layout">
        <SceneTree
          baseScenes={baseScenes}
          onSelectScene={setSelectedSceneId}
          scenes={scenes}
          selectedSceneId={selectedSceneId}
        />
        <div className="admin-content">
          <nav className="admin-tabs" role="tablist" aria-label="管理面板">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? "is-active" : undefined}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="admin-stack" role="tabpanel">
            {activeTab === "overview" ? (
              <AdminOverviewPanel
                baseSceneName={baseSceneName}
                scene={activeScene}
                isSavingMetadata={updateSceneMetadata.isPending}
                metadataDescription={metadataDescription}
                metadataName={metadataName}
                onMetadataDescriptionChange={setMetadataDescription}
                onMetadataNameChange={setMetadataName}
                onSaveMetadata={() => {
                  void handleSaveMetadata();
                }}
              />
            ) : null}
            {activeTab === "model" ? (
              <PromptPanel
                baseUrl={baseUrl}
                isSaving={updateSceneDetail.isPending}
                modelName={modelName}
                onBaseUrlChange={setBaseUrl}
                onModelNameChange={setModelName}
                onSave={() => {
                  void handleSaveModelConfig();
                }}
              />
            ) : null}
            {activeTab === "prompt" ? (
              <section className="admin-panel glass-surface">
                <header className="admin-panel__header">
                  <div>
                    <h3>提示词工作台</h3>
                    <p>直接编辑当前场景的 `system.md`，保存后运行时会读取最新提示词。</p>
                  </div>
                </header>
                <div className="admin-placeholder">
                  <p>把业务目标、边界、输出格式和禁止事项写清楚，避免模型行为发散。</p>
                  <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} />
                </div>
                <div className="admin-panel__actions">
                  <p className="admin-panel__hint">保存后会立即写回场景目录。</p>
                  <button className="admin-button" onClick={() => void handleSavePrompt()} type="button">
                    {updateScenePrompt.isPending ? "保存中..." : "保存提示词"}
                  </button>
                </div>
              </section>
            ) : null}
            {activeTab === "skills" ? <SkillPanel /> : null}
            {activeTab === "workspace" ? <WorkspacePanel /> : null}
            {activeTab === "release" ? (
              <section className="admin-panel glass-surface">
                <header className="admin-panel__header">
                  <div>
                    <h3>发布面板</h3>
                    <p>保留新稿中的版本感知和发布入口，不引入新的后端流程。</p>
                  </div>
                </header>
                <div className="admin-release">
                  <div className="admin-glass-tile">
                    <p>当前草稿</p>
                    <strong>v2026.04.12-rc1</strong>
                    <span>最近一次视觉调整已完成结构重排，待进一步接入发布链路。</span>
                  </div>
                  <button className="admin-page__primary-action" type="button">
                    发布新版本
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

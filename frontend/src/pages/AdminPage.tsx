import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AdminWorkspacePanel } from "../components/admin/AdminWorkspacePanel";
import { CreateSceneModal } from "../components/admin/CreateSceneModal";
import { SceneTree } from "../components/admin/SceneTree";
import { SkillPanel } from "../components/admin/SkillPanel";
import { EmptySceneGuide } from "../components/common/EmptySceneGuide";
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

type AdminTab = "workspace" | "skills";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "workspace", label: "工作台" },
  { id: "skills", label: "Skills" },
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: baseScenes = [] } = useBaseScenes();
  const { data: scenes = [] } = useScenes("admin");
  const [emptySceneCountdown, setEmptySceneCountdown] = useState(10);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("workspace");
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
    if (selectedSceneId && !scenes.some((scene) => scene.id === selectedSceneId)) {
      setSelectedSceneId(scenes[0]?.id ?? null);
      return;
    }

    if (!selectedSceneId && scenes[0]) {
      setSelectedSceneId(scenes[0].id);
    }
  }, [scenes, selectedSceneId]);

  useEffect(() => {
    if (searchParams.get("createScene") !== "1") {
      return;
    }

    setIsCreateModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("createScene");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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

  useEffect(() => {
    if (scenes.length > 0) {
      setEmptySceneCountdown(10);
      return;
    }

    setEmptySceneCountdown(10);
    const timer = window.setInterval(() => {
      setEmptySceneCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsCreateModalOpen(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [scenes.length]);

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
      setCreateError("请填写完整的场景名称、场景编码和场景描述");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(createForm.scene_id)) {
      setCreateError("场景编码只允许小写字母、数字和连字符");
      return;
    }

    try {
      const createdScene = await createScene.mutateAsync(createForm);
      setSelectedSceneId(createdScene.id);
      setActiveTab("workspace");
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

  return (
    <section className="admin-page">
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

      {scenes.length === 0 ? (
        <main className="admin-page__empty-shell">
          <EmptySceneGuide
            countdown={emptySceneCountdown}
            description="当前还没有任何业务场景。先创建一个场景，才能继续配置提示词、技能和工作区。"
            title="还没有业务场景"
            onNavigate={() => {
              navigate("/admin?createScene=1", { replace: true });
              setIsCreateModalOpen(true);
            }}
          />
        </main>
      ) : (
      <div className="admin-layout">
        <SceneTree
          baseScenes={baseScenes}
          onCreateScene={() => setIsCreateModalOpen(true)}
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
            {activeTab === "workspace" ? (
              <AdminWorkspacePanel
                baseUrl={baseUrl}
                isSavingModel={updateSceneDetail.isPending}
                scene={activeScene}
                isSavingMetadata={updateSceneMetadata.isPending}
                isSavingPrompt={updateScenePrompt.isPending}
                metadataDescription={metadataDescription}
                metadataName={metadataName}
                modelName={modelName}
                onBaseUrlChange={setBaseUrl}
                onMetadataDescriptionChange={setMetadataDescription}
                onMetadataNameChange={setMetadataName}
                onModelNameChange={setModelName}
                onSaveMetadata={handleSaveMetadata}
                onSaveModel={handleSaveModelConfig}
                onSavePrompt={handleSavePrompt}
                onSystemPromptChange={setSystemPrompt}
                systemPrompt={systemPrompt}
              />
            ) : null}
            {activeTab === "skills" ? <SkillPanel sceneId={selectedSceneId} /> : null}
          </div>
        </div>
      </div>
      )}
    </section>
  );
}

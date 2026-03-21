import { useEffect, useState } from "react";

import { PromptPanel } from "../components/admin/PromptPanel";
import { SceneTree } from "../components/admin/SceneTree";
import { SkillPanel } from "../components/admin/SkillPanel";
import { WorkspacePanel } from "../components/admin/WorkspacePanel";
import { useBaseScenes, useSceneDetail, useScenes, useUpdateSceneDetail } from "../hooks/useScenes";
import "../styles/admin.css";

export function AdminPage() {
  const { data: baseScenes = [] } = useBaseScenes();
  const { data: scenes = [] } = useScenes("admin");
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const { data: sceneDetail } = useSceneDetail(selectedSceneId);
  const updateSceneDetail = useUpdateSceneDetail(selectedSceneId);
  const [baseUrl, setBaseUrl] = useState("");
  const [modelName, setModelName] = useState("");

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
  }, [sceneDetail]);

  async function handleSave() {
    if (!selectedSceneId) {
      return;
    }

    await updateSceneDetail.mutateAsync({
      base_url: baseUrl,
      model_name: modelName
    });
  }

  return (
    <section className="admin-layout">
      <SceneTree
        baseScenes={baseScenes}
        onSelectScene={setSelectedSceneId}
        scenes={scenes}
        selectedSceneId={selectedSceneId}
      />
      <div className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">管理控制台</p>
            <h2>{sceneDetail?.name ?? scenes[0]?.name ?? "场景目录"}</h2>
          </div>
          <div className="admin-tabs" role="tablist" aria-label="管理面板">
            <button aria-selected="true" role="tab" type="button">
              模型配置
            </button>
            <button aria-selected="false" role="tab" type="button">
              技能
            </button>
            <button aria-selected="false" role="tab" type="button">
              工作区
            </button>
          </div>
        </header>
        <div className="admin-stack">
          <PromptPanel
            baseUrl={baseUrl}
            isSaving={updateSceneDetail.isPending}
            modelName={modelName}
            onBaseUrlChange={setBaseUrl}
            onModelNameChange={setModelName}
            onSave={() => {
              void handleSave();
            }}
          />
          <SkillPanel />
          <WorkspacePanel />
        </div>
      </div>
    </section>
  );
}

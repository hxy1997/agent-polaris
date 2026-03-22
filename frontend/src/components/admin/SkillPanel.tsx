import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  useDeleteSkillNode,
  useSkillFile,
  useSkillTree,
  useUploadSkillDirectory
} from "../../hooks/useScenes";
import type { SkillNode } from "../../lib/api";
import { AppIcon } from "../common/AppIcon";

type SkillPanelProps = {
  sceneId: string | null;
};

function flattenNodes(nodes: SkillNode[]): SkillNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children)]);
}

function ancestorPaths(path: string): string[] {
  const segments = path.split("/").filter(Boolean);
  return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join("/"));
}

function firstSkillFile(nodes: SkillNode[]): SkillNode | null {
  for (const node of nodes) {
    if (node.node_type === "file") {
      return node;
    }

    const nestedFile = firstSkillFile(node.children);
    if (nestedFile) {
      return nestedFile;
    }
  }

  return null;
}

function sourceLabel(source: "base" | "scene") {
  return source === "scene" ? "场景技能" : "基础技能";
}

function SkillTreeBranch({
  expandedPaths,
  onDeleteSkillRoot,
  onToggleDirectory,
  onSelectFile,
  selectedNodeId,
  nodes,
  depth = 0
}: {
  expandedPaths: Set<string>;
  onDeleteSkillRoot: (node: SkillNode) => void;
  onToggleDirectory: (node: SkillNode) => void;
  onSelectFile: (node: SkillNode) => void;
  selectedNodeId: string | null;
  nodes: SkillNode[];
  depth?: number;
}) {
  return (
    <ul className="skill-tree__group">
      {nodes.map((node) => {
        const isDirectory = node.node_type === "directory";
        const isExpanded = isDirectory && expandedPaths.has(node.path);
        const isSelected = node.id === selectedNodeId;
        const paddingLeft = 12 + depth * 18;
        const showDeleteAction =
          depth === 0 && node.node_type === "directory" && node.is_skill_root && node.source === "scene";

        return (
          <li key={node.id}>
            <div className={`skill-tree__item${showDeleteAction ? " has-action" : ""}`}>
              <button
                aria-expanded={isDirectory ? isExpanded : undefined}
                className={`skill-tree__row${isSelected ? " is-selected" : ""}${node.is_read_only ? " is-readonly" : ""}`}
                style={{ paddingLeft }}
                type="button"
                onClick={() => {
                  if (isDirectory) {
                    onToggleDirectory(node);
                    return;
                  }

                  onSelectFile(node);
                }}
              >
                <span className="skill-tree__twist" aria-hidden="true">
                  {isDirectory ? (
                    <AppIcon name={isExpanded ? "chevron-down" : "chevron-right"} />
                  ) : (
                    <span className="skill-tree__twist-placeholder" />
                  )}
                </span>
                <span className="skill-tree__icon" aria-hidden="true">
                  <AppIcon name={isDirectory ? "folder" : "file"} />
                </span>
                <span className="skill-tree__name">{node.name}</span>
                <span className="skill-tree__meta">
                  {node.is_overridden ? <span className="skill-tree__badge">Override</span> : null}
                  {node.source === "base" ? (
                    <span className="skill-tree__badge skill-tree__badge--readonly">Inherited</span>
                  ) : null}
                </span>
              </button>
              {showDeleteAction ? (
                <button
                  aria-label={`删除技能 ${node.name}`}
                  className="skill-tree__row-action"
                  title={`删除技能 ${node.name}`}
                  type="button"
                  onClick={() => onDeleteSkillRoot(node)}
                >
                  <AppIcon name="trash" />
                </button>
              ) : null}
            </div>
            {isDirectory && isExpanded && node.children.length > 0 ? (
              <SkillTreeBranch
                depth={depth + 1}
                expandedPaths={expandedPaths}
                nodes={node.children}
                onDeleteSkillRoot={onDeleteSkillRoot}
                selectedNodeId={selectedNodeId}
                onSelectFile={onSelectFile}
                onToggleDirectory={onToggleDirectory}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function SkillPanel({ sceneId }: SkillPanelProps) {
  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const { data: treeResponse, isLoading, error } = useSkillTree(sceneId);
  const nodes = treeResponse?.nodes ?? [];
  const allNodes = useMemo(() => flattenNodes(nodes), [nodes]);
  const sceneSkillRoots = useMemo(
    () => nodes.filter((node) => node.node_type === "directory" && node.is_skill_root && node.source === "scene"),
    [nodes]
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const selectedNode = allNodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedFile = selectedNode?.node_type === "file" ? selectedNode : null;
  const uploadSkillDirectory = useUploadSkillDirectory(sceneId);
  const deleteSkillNode = useDeleteSkillNode(sceneId);
  const skillFile = useSkillFile(
    sceneId,
    selectedFile?.source ?? null,
    selectedFile?.path ?? null
  );

  const activeSceneSkill = useMemo(() => {
    if (!selectedNode || selectedNode.source !== "scene") {
      return null;
    }

    const [skillRoot] = selectedNode.path.split("/");
    return (
      allNodes.find((node) => node.is_skill_root && node.source === "scene" && node.path === skillRoot) ?? null
    );
  }, [allNodes, selectedNode]);

  useEffect(() => {
    setExpandedPaths((current) => {
      const next = new Set(current);

      for (const node of nodes) {
        if (node.node_type === "directory") {
          next.add(node.path);
        }
      }

      if (selectedFile) {
        for (const path of ancestorPaths(selectedFile.path)) {
          next.add(path);
        }
      }

      return next;
    });
  }, [nodes, selectedFile]);

  useEffect(() => {
    if (!selectedNodeId) {
      return;
    }

    if (allNodes.some((node) => node.id === selectedNodeId)) {
      return;
    }

    setSelectedNodeId(null);
  }, [allNodes, selectedNodeId]);

  useEffect(() => {
    if (selectedNodeId || !nodes.length) {
      return;
    }

    const defaultFile = firstSkillFile(nodes);
    if (defaultFile) {
      setSelectedNodeId(defaultFile.id);
    }
  }, [nodes, selectedNodeId]);

  async function handleUploadDirectory(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const firstRelativePath = files[0].webkitRelativePath || files[0].name;
    const [folderName] = firstRelativePath.split("/");
    if (!folderName) {
      setActionError("未能识别上传目录名称");
      return;
    }

    const formData = new FormData();
    formData.append("folder_name", folderName);

    for (const file of files) {
      const relativePath = file.webkitRelativePath
        ? file.webkitRelativePath.split("/").slice(1).join("/")
        : file.name;
      formData.append("paths", relativePath);
      formData.append("files", file, file.name);
    }

    try {
      await uploadSkillDirectory.mutateAsync({ formData });
      setExpandedPaths((current) => new Set(current).add(folderName));
      setSelectedNodeId(`scene:${folderName}`);
      setActionError(null);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "技能目录上传失败");
    } finally {
      event.target.value = "";
    }
  }

  async function handleDeleteSkill(targetNode: SkillNode | null = activeSceneSkill) {
    if (!targetNode) {
      return;
    }

    const confirmed = window.confirm(`确认删除技能 ${targetNode.name} 吗？`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteSkillNode.mutateAsync(targetNode.path);
      setSelectedNodeId(null);
      setActionError(null);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : "技能删除失败");
    }
  }

  return (
    <section className="admin-panel glass-surface">
      <header className="admin-panel__header">
        <div className="skill-panel__title">
          <h3>技能文件管理</h3>
          <span className="skill-panel__title-meta">{sceneSkillRoots.length} 个技能</span>
        </div>
        <button
          aria-label="上传技能目录"
          className="skill-panel__header-action"
          disabled={!sceneId || uploadSkillDirectory.isPending}
          title={uploadSkillDirectory.isPending ? "上传中…" : "上传技能目录"}
          type="button"
          onClick={() => directoryInputRef.current?.click()}
        >
          <AppIcon name="plus" />
        </button>
      </header>

      <div className="skill-panel">
        <aside className="skill-panel__sidebar">
          <input
            ref={directoryInputRef}
            className="visually-hidden"
            multiple
            type="file"
            {...({ directory: "", webkitdirectory: "" } as Record<string, string>)}
            onChange={handleUploadDirectory}
          />
          <div className="skill-panel__section-head">
            <span className="skill-panel__section-label">技能目录</span>
            <span className="skill-panel__section-meta">{sceneSkillRoots.length}</span>
          </div>
          {actionError ? <p className="admin-form-error">{actionError}</p> : null}
          <div className="skill-tree">
            {isLoading ? <p className="skill-panel__empty">正在加载技能树…</p> : null}
            {error ? <p className="admin-form-error">{error instanceof Error ? error.message : "技能树加载失败"}</p> : null}
            {!isLoading && !nodes.length ? <p className="skill-panel__empty">当前场景还没有技能，先上传一个完整技能目录。</p> : null}
            {nodes.length > 0 ? (
              <SkillTreeBranch
                expandedPaths={expandedPaths}
                nodes={nodes}
                onDeleteSkillRoot={(node) => {
                  void handleDeleteSkill(node);
                }}
                selectedNodeId={selectedNodeId}
                onSelectFile={(node) => {
                  setSelectedNodeId(node.id);
                  setActionError(null);
                }}
                onToggleDirectory={(node) => {
                  setSelectedNodeId(node.id);
                  setActionError(null);
                  setExpandedPaths((current) => {
                    const next = new Set(current);
                    if (next.has(node.path)) {
                      next.delete(node.path);
                    } else {
                      next.add(node.path);
                    }
                    return next;
                  });
                }}
              />
            ) : null}
          </div>
        </aside>

        <div className="skill-panel__editor">
          <div className="skill-panel__section-head skill-panel__section-head--preview">
            <span className="skill-panel__section-label">文件预览</span>
            <span className="skill-panel__section-meta">
              {selectedFile ? selectedFile.name : "只读"}
            </span>
          </div>
          {selectedFile && skillFile.isLoading ? (
            <div className="skill-panel__empty-state">
              <h4>正在加载…</h4>
              <p>正在读取 {selectedFile.name} 的内容。</p>
            </div>
          ) : null}

          {selectedFile && skillFile.error ? (
            <div className="skill-panel__empty-state">
              <h4>预览失败</h4>
              <p>{skillFile.error instanceof Error ? skillFile.error.message : "技能文件读取失败"}</p>
            </div>
          ) : null}

          {selectedFile && skillFile.data ? (
            <>
              <div className="skill-editor__header">
                <div>
                  <h4>{skillFile.data.name}</h4>
                  <p>{skillFile.data.path}</p>
                </div>
                <div className="skill-editor__labels">
                  <span className="skill-tree__badge">{sourceLabel(skillFile.data.source)}</span>
                  {activeSceneSkill ? <span className="skill-tree__badge skill-tree__badge--subtle">{activeSceneSkill.name}</span> : null}
                </div>
              </div>
              <div className="skill-editor__surface">
                <pre className="skill-editor__content">{skillFile.data.content || "空文件"}</pre>
              </div>
            </>
          ) : null}

          {!selectedFile && !skillFile.isLoading ? (
            <div className="skill-panel__empty-state">
              <h4>选择一个文件</h4>
              <p>点击左侧文件即可在这里预览内容；点击目录会展开或收起文件树。</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

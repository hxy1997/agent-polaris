import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";

import {
  useCopySkillFromBase,
  useCreateSkill,
  useCreateSkillDirectory,
  useCreateSkillFile,
  useDeleteSkillNode,
  useRenameSkillNode,
  useSkillFile,
  useSkillTree,
  useUpdateSkillFile
} from "../../hooks/useScenes";
import type { SkillNode } from "../../lib/api";

type SkillPanelProps = {
  sceneId: string | null;
};

type ContextMenuState = {
  node: SkillNode;
  x: number;
  y: number;
};

type ModalState =
  | { type: "create-skill" }
  | { type: "create-file"; parentPath: string }
  | { type: "create-directory"; parentPath: string }
  | { type: "rename"; path: string; initialValue: string }
  | null;

type TreeNodeData = SkillNode;

const treeHeight = 560;

function guessLanguage(name: string): string {
  if (name.endsWith(".md")) {
    return "markdown";
  }
  if (name.endsWith(".json")) {
    return "json";
  }
  if (name.endsWith(".toml")) {
    return "ini";
  }
  if (name.endsWith(".py")) {
    return "python";
  }
  if (name.endsWith(".ts") || name.endsWith(".tsx")) {
    return "typescript";
  }
  return "plaintext";
}

function flattenNodes(nodes: SkillNode[]): SkillNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children)]);
}

function SkillTreeNodeRenderer({
  node,
  style,
  dragHandle,
  onSelect,
  onContextMenu
}: NodeRendererProps<TreeNodeData> & {
  onSelect: (node: SkillNode) => void;
  onContextMenu: (event: MouseEvent<HTMLDivElement>, node: SkillNode) => void;
}) {
  const { data } = node;
  const depth = node.level * 18 + 8;

  return (
    <div
      ref={dragHandle}
      className={`skill-tree__row ${node.isSelected ? "is-selected" : ""} ${data.is_read_only ? "is-readonly" : ""}`}
      style={{ ...style, paddingLeft: depth }}
      onClick={() => {
        onSelect(data);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu(event, data);
      }}
    >
      <button
        aria-label={node.isOpen ? "收起" : "展开"}
        className="skill-tree__twist"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (node.isInternal) {
            node.toggle();
          }
        }}
      >
        {node.isInternal ? (node.isOpen ? "▾" : "▸") : ""}
      </button>
      <span className="skill-tree__icon" aria-hidden="true">
        {data.node_type === "directory" ? "📁" : "📄"}
      </span>
      <span className="skill-tree__name">{data.name}</span>
      {data.is_overridden ? <span className="skill-tree__badge">Override</span> : null}
      {data.source === "base" ? <span className="skill-tree__badge skill-tree__badge--readonly">Inherited</span> : null}
    </div>
  );
}

function ActionModal({
  confirmLabel,
  error,
  isOpen,
  onClose,
  onSubmit,
  placeholder,
  title,
  value
}: {
  confirmLabel: string;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  title: string;
  value: string;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-modal" role="presentation">
      <div className="admin-modal__backdrop" onClick={onClose} />
      <div aria-label={title} className="admin-modal__panel glass-surface--strong" role="dialog">
        <header className="admin-panel__header">
          <div>
            <h3>{title}</h3>
          </div>
        </header>
        <label className="admin-field">
          <span>名称</span>
          <input autoFocus placeholder={placeholder} type="text" value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        {error ? <p className="admin-form-error">{error}</p> : null}
        <div className="admin-panel__actions">
          <button className="admin-page__secondary-action" type="button" onClick={onClose}>
            取消
          </button>
          <button className="admin-button" type="button" onClick={() => onSubmit(draft)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SkillPanel({ sceneId }: SkillPanelProps) {
  const { data: treeResponse, isLoading, error } = useSkillTree(sceneId);
  const nodes = treeResponse?.nodes ?? [];
  const allNodes = useMemo(() => flattenNodes(nodes), [nodes]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editorDraft, setEditorDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const selectedNode = allNodes.find((node) => node.id === selectedNodeId) ?? null;
  const skillFile = useSkillFile(
    sceneId,
    selectedNode?.node_type === "file" ? selectedNode.source : null,
    selectedNode?.node_type === "file" ? selectedNode.path : null
  );
  const createSkill = useCreateSkill(sceneId);
  const createSkillFile = useCreateSkillFile(sceneId);
  const createSkillDirectory = useCreateSkillDirectory(sceneId);
  const copySkillFromBase = useCopySkillFromBase(sceneId);
  const updateSkillFile = useUpdateSkillFile(sceneId);
  const renameSkillNode = useRenameSkillNode(sceneId);
  const deleteSkillNode = useDeleteSkillNode(sceneId);

  useEffect(() => {
    if (!selectedNode && nodes[0]) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNode]);

  useEffect(() => {
    if (skillFile.data) {
      setEditorDraft(skillFile.data.content);
      setIsEditing(false);
    }
  }, [skillFile.data]);

  useEffect(() => {
    function handleWindowClick() {
      setContextMenu(null);
    }

    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  function openModal(nextState: ModalState) {
    setModalError(null);
    setModalState(nextState);
  }

  async function handleModalSubmit(value: string) {
    if (!modalState) {
      return;
    }

    try {
      if (modalState.type === "create-skill") {
        await createSkill.mutateAsync({ skill_id: value });
        setSelectedNodeId(`scene:${value}`);
      } else if (modalState.type === "create-file") {
        await createSkillFile.mutateAsync({ parent_path: modalState.parentPath, name: value });
        setSelectedNodeId(`scene:${modalState.parentPath}/${value}`);
      } else if (modalState.type === "create-directory") {
        await createSkillDirectory.mutateAsync({ parent_path: modalState.parentPath, name: value });
        setSelectedNodeId(`scene:${modalState.parentPath}/${value}`);
      } else if (modalState.type === "rename") {
        const parentPath = modalState.path.split("/").slice(0, -1).join("/");
        await renameSkillNode.mutateAsync({ path: modalState.path, new_name: value });
        setSelectedNodeId(`scene:${parentPath ? `${parentPath}/` : ""}${value}`);
      }
      setModalState(null);
    } catch (mutationError) {
      setModalError(mutationError instanceof Error ? mutationError.message : "操作失败");
    }
  }

  const selectedDirectory =
    selectedNode && selectedNode.node_type === "directory" && selectedNode.source === "scene" ? selectedNode : null;
  const selectedFile = selectedNode && selectedNode.node_type === "file" ? selectedNode : null;
  const selectedSkillId = selectedNode?.path.split("/")[0] ?? null;
  const contextMenuCanRename = Boolean(
    contextMenu &&
      contextMenu.node.source === "scene" &&
      !contextMenu.node.is_skill_root
  );
  const contextMenuCanDelete = Boolean(contextMenu && contextMenu.node.source === "scene");

  async function handleDelete(node: SkillNode) {
    const confirmed = window.confirm(`确认删除 ${node.name} 吗？`);
    if (!confirmed) {
      return;
    }
    await deleteSkillNode.mutateAsync(node.path);
    setSelectedNodeId(null);
  }

  async function handleCopyFromBase(skillId: string) {
    await copySkillFromBase.mutateAsync({ skill_id: skillId });
    setSelectedNodeId(`scene:${skillId}`);
  }

  async function handleSaveFile() {
    if (!selectedFile || selectedFile.source !== "scene") {
      return;
    }
    await updateSkillFile.mutateAsync({
      path: selectedFile.path,
      content: editorDraft
    });
    setIsEditing(false);
  }

  return (
    <section className="admin-panel glass-surface">
      <header className="admin-panel__header">
        <div>
          <h3>技能文件管理</h3>
          <p>继承基础技能，按场景覆盖。顶级目录代表技能根目录，`SKILL.md` 会按模板初始化。</p>
        </div>
      </header>

      <div className="skill-panel">
        <aside className="skill-panel__sidebar">
          <div className="skill-toolbar">
            <button className="admin-button" type="button" onClick={() => openModal({ type: "create-skill" })}>
              新建技能
            </button>
            <button
              className="admin-page__secondary-action"
              disabled={!selectedDirectory}
              type="button"
              onClick={() => selectedDirectory && openModal({ type: "create-file", parentPath: selectedDirectory.path })}
            >
              新增文件
            </button>
            <button
              className="admin-page__secondary-action"
              disabled={!selectedDirectory}
              type="button"
              onClick={() => selectedDirectory && openModal({ type: "create-directory", parentPath: selectedDirectory.path })}
            >
              新增目录
            </button>
          </div>
          <div className="skill-tree">
            {isLoading ? <p className="skill-panel__empty">正在加载技能树...</p> : null}
            {error ? <p className="admin-form-error">{error instanceof Error ? error.message : "技能树加载失败"}</p> : null}
            {!isLoading && !nodes.length ? <p className="skill-panel__empty">当前场景还没有技能，先新建一个技能目录。</p> : null}
            {nodes.length ? (
              <Tree<TreeNodeData>
                data={nodes}
                disableDrag
                disableMultiSelection
                height={treeHeight}
                idAccessor="id"
                openByDefault
                selection={selectedNodeId ?? undefined}
                width={340}
              >
                {(props) => (
                  <SkillTreeNodeRenderer
                    {...props}
                    onContextMenu={(event, node) => {
                      setContextMenu({ node, x: event.clientX, y: event.clientY });
                    }}
                    onSelect={(node) => {
                      setSelectedNodeId(node.id);
                    }}
                  />
                )}
              </Tree>
            ) : null}
          </div>
        </aside>

        <div className="skill-panel__editor">
          {selectedFile && skillFile.data ? (
            <>
              <div className="skill-editor__header">
                <div>
                  <h4>{skillFile.data.name}</h4>
                  <p>
                    {skillFile.data.source === "base" ? "继承自基础技能，只读预览" : "场景私有技能文件"}
                  </p>
                </div>
                <div className="skill-editor__actions">
                  {selectedFile.source === "base" && selectedSkillId ? (
                    <button className="admin-page__secondary-action" type="button" onClick={() => void handleCopyFromBase(selectedSkillId)}>
                      复制为场景私有技能
                    </button>
                  ) : null}
                  {selectedFile.source === "scene" ? (
                    <>
                      {!isEditing ? (
                        <button className="admin-page__secondary-action" type="button" onClick={() => setIsEditing(true)}>
                          编辑
                        </button>
                      ) : (
                        <>
                          <button className="admin-page__secondary-action" type="button" onClick={() => {
                            setEditorDraft(skillFile.data.content);
                            setIsEditing(false);
                          }}>
                            取消
                          </button>
                          <button className="admin-button" type="button" onClick={() => void handleSaveFile()}>
                            保存
                          </button>
                        </>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
              <div className="skill-editor__surface">
                <Editor
                  height="100%"
                  language={guessLanguage(skillFile.data.name)}
                  options={{
                    minimap: { enabled: false },
                    readOnly: skillFile.data.is_read_only || !isEditing,
                    scrollBeyondLastLine: false,
                    wordWrap: "on"
                  }}
                  theme="vs-light"
                  value={isEditing ? editorDraft : skillFile.data.content}
                  onChange={(value) => setEditorDraft(value ?? "")}
                />
              </div>
            </>
          ) : (
            <div className="skill-panel__empty-state">
              <h4>选择一个文件</h4>
              <p>选中文件后在这里预览内容；选中目录时保持空态。</p>
            </div>
          )}
        </div>
      </div>

      {contextMenu ? (
        <div
          className="skill-context-menu glass-surface--strong"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {contextMenu.node.source === "base" && contextMenu.node.is_skill_root ? (
            <button type="button" onClick={() => {
              void handleCopyFromBase(contextMenu.node.path);
              setContextMenu(null);
            }}>
              复制为场景私有技能
            </button>
          ) : null}
          {contextMenu.node.source === "scene" && contextMenu.node.node_type === "directory" ? (
            <>
              <button type="button" onClick={() => {
                openModal({ type: "create-file", parentPath: contextMenu.node.path });
                setContextMenu(null);
              }}>
                新增文件
              </button>
              <button type="button" onClick={() => {
                openModal({ type: "create-directory", parentPath: contextMenu.node.path });
                setContextMenu(null);
              }}>
                新增目录
              </button>
            </>
          ) : null}
          {contextMenuCanRename ? (
            <button type="button" onClick={() => {
              openModal({ type: "rename", path: contextMenu.node.path, initialValue: contextMenu.node.name });
              setContextMenu(null);
            }}>
              重命名
            </button>
          ) : null}
          {contextMenuCanDelete ? (
            <button type="button" onClick={() => {
              void handleDelete(contextMenu.node);
              setContextMenu(null);
            }}>
              {contextMenu.node.is_skill_root ? "删除技能" : "删除"}
            </button>
          ) : null}
        </div>
      ) : null}

      <ActionModal
        confirmLabel={modalState?.type === "rename" ? "保存名称" : "确认创建"}
        error={modalError}
        isOpen={modalState !== null}
        placeholder="输入名称"
        title={
          modalState?.type === "create-skill"
            ? "新建技能"
            : modalState?.type === "create-file"
              ? "新增文件"
              : modalState?.type === "create-directory"
                ? "新增目录"
                : "重命名"
        }
        value={modalState?.type === "rename" ? modalState.initialValue : ""}
        onClose={() => setModalState(null)}
        onSubmit={(value) => {
          void handleModalSubmit(value);
        }}
      />
    </section>
  );
}

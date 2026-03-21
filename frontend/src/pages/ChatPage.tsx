import { useState } from "react";

import { ChatShell } from "../components/chat/ChatShell";
import { Composer } from "../components/chat/Composer";
import { SuggestionChips } from "../components/chat/SuggestionChips";
import { useChatSession } from "../hooks/useChatSession";
import { useScenes } from "../hooks/useScenes";
import "../styles/chat.css";

export function ChatPage() {
  const { data: scenes = [] } = useScenes();
  const { error, isStreaming, messages, sendMessage } = useChatSession();
  const [draft, setDraft] = useState("");
  const activeScene = scenes[0];
  const title = activeScene?.name ?? "正在加载场景";
  const description = activeScene
    ? "读取客户上下文，整理需求，并把原始记录转成清晰的业务答复。"
    : "正在加载最新发布的场景配置。";

  async function handleSubmit() {
    if (!activeScene || !draft.trim()) {
      return;
    }

    const currentDraft = draft.trim();
    setDraft("");
    await sendMessage(activeScene.id, currentDraft);
  }

  return (
    <ChatShell
      title={title}
      description={description}
      errorMessage={error}
      conversation={
        <div className="conversation">
          {messages.length === 0 ? (
            <div className="conversation__empty">
              <p>从一个需求、一段客户笔记或一份会议纪要开始。</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`conversation__message conversation__message--${message.role}`}
              >
                <span>{message.role === "user" ? "你" : "Polaris"}</span>
                <p>{message.content || (isStreaming ? "正在生成回复..." : "")}</p>
              </article>
            ))
          )}
        </div>
      }
      composer={
        <Composer
          disabled={!activeScene || isStreaming}
          isBusy={isStreaming}
          onChange={setDraft}
          onSubmit={() => {
            void handleSubmit();
          }}
          placeholder="输入请求、客户笔记或产品背景"
          value={draft}
        />
      }
      suggestions={<SuggestionChips />}
    />
  );
}

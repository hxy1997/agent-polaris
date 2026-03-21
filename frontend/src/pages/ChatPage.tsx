import type { UIMessage } from "ai";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";

import { ChatShell } from "../components/chat/ChatShell";
import { Composer } from "../components/chat/Composer";
import { MarkdownMessage } from "../components/chat/MarkdownMessage";
import { SuggestionChips } from "../components/chat/SuggestionChips";
import { useChatSession } from "../hooks/useChatSession";
import { useScenes } from "../hooks/useScenes";
import { createClientId } from "../lib/createClientId";
import {
  DEFAULT_CHAT_USER_ID,
  getChatSessionMessages,
  listChatHistory,
  type ChatHistoryEntry
} from "../lib/api";
import "../styles/chat.css";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function getMessageFiles(message: UIMessage) {
  return message.parts.filter(
    (part): part is Extract<UIMessage["parts"][number], { type: "file" }> => part.type === "file"
  );
}

function createMessageId(role: "assistant" | "user") {
  return createClientId(role);
}

function formatHistoryTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "刚刚更新";
  }

  return date.toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "numeric",
    day: "numeric"
  });
}

export function ChatPage() {
  const { data: scenes = [] } = useScenes();
  const activeScene = scenes[0];
  const {
    error,
    input,
    isStreaming,
    messages,
    restoreSession,
    sendMessage,
    sessionId,
    setInput,
    startNewSession,
    userId
  } = useChatSession({
    sceneId: activeScene?.id,
    userId: DEFAULT_CHAT_USER_ID
  });
  const [historyEntries, setHistoryEntries] = useState<ChatHistoryEntry[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const conversationViewportRef = useRef<HTMLDivElement | null>(null);
  const conversationBottomRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const hasConversation = messages.length > 0;
  const title = activeScene?.name ?? "正在加载场景";
  const description = activeScene
    ? "读取客户上下文，整理需求，并把原始记录转成清晰的业务答复。"
    : "正在加载最新发布的场景配置。";

  useEffect(() => {
    if (!isHistoryOpen || !activeScene) {
      return;
    }

    let cancelled = false;
    setIsHistoryLoading(true);
    setHistoryError(null);

    void listChatHistory(activeScene.id, userId)
      .then((entries) => {
        if (!cancelled) {
          setHistoryEntries(entries);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setHistoryError(nextError instanceof Error ? nextError.message : "历史会话加载失败");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeScene, isHistoryOpen, userId]);

  useLayoutEffect(() => {
    if (!hasConversation || !shouldAutoScrollRef.current) {
      return;
    }

    const viewport = conversationViewportRef.current;
    if (!viewport) {
      conversationBottomRef.current?.scrollIntoView({
        behavior: isStreaming ? "auto" : "smooth",
        block: "end"
      });
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth"
    });
  }, [hasConversation, isStreaming, messages]);

  function updateAutoScrollState() {
    const viewport = conversationViewportRef.current;
    if (!viewport) {
      return;
    }

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 48;
  }

  function handleSubmit() {
    shouldAutoScrollRef.current = true;
    void sendMessage();
  }

  function handleStartNewSession() {
    shouldAutoScrollRef.current = true;
    setIsHistoryOpen(false);
    startNewSession();
  }

  async function handleOpenConversation(nextSessionId: string) {
    shouldAutoScrollRef.current = true;
    try {
      const payload = await getChatSessionMessages(nextSessionId, userId);
      restoreSession(
        nextSessionId,
        payload.messages.map((message) => ({
          id: createMessageId(message.role),
          parts: [{ type: "text", text: message.content }],
          role: message.role
        }))
      );
      setHistoryError(null);
      setIsHistoryOpen(false);
    } catch (nextError) {
      setHistoryError(nextError instanceof Error ? nextError.message : "历史会话恢复失败");
    }
  }

  const composer = (
    <Composer
      disabled={!activeScene || isStreaming}
      isBusy={isStreaming}
      onChange={setInput}
      onSubmit={handleSubmit}
      placeholder="输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要"
      value={input}
      variant={hasConversation ? "dock" : "landing"}
    />
  );

  return (
    <div className="chat-page">
      <header className="chat-page__topbar glass-surface--strong">
        <div className="chat-page__brand">
          <span className="chat-page__brand-name">Polaris</span>
          <button className="chat-page__scene-selector" type="button">
            <span>场景: {title}</span>
            <span aria-hidden="true" className="material-symbols-outlined">
              keyboard_arrow_down
            </span>
          </button>
        </div>
        <nav className="chat-page__nav" aria-label="模式导航">
          <NavLink className={({ isActive }) => (isActive ? "is-active" : undefined)} to="/chat">
            对话模式
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "is-active" : undefined)} to="/admin">
            管理后台
          </NavLink>
        </nav>
        <div className="chat-page__actions" aria-label="页面操作">
          <button className="chat-page__icon-button" type="button">
            <span aria-hidden="true" className="material-symbols-outlined">
              notifications
            </span>
            <span className="visually-hidden">通知</span>
          </button>
          <button className="chat-page__icon-button" type="button">
            <span aria-hidden="true" className="material-symbols-outlined">
              help
            </span>
            <span className="visually-hidden">帮助</span>
          </button>
          <div aria-hidden="true" className="page-avatar">
            P
          </div>
        </div>
      </header>

      <aside className="chat-page__rail glass-surface--strong" aria-label="快捷导航">
        <button className="chat-page__rail-item chat-page__rail-item--active" type="button">
          <span aria-hidden="true" className="material-symbols-outlined">
            home
          </span>
          <span>首页</span>
        </button>
        <button className="chat-page__rail-item" type="button" onClick={handleStartNewSession}>
          <span aria-hidden="true" className="material-symbols-outlined">
            add_circle
          </span>
          <span>新会话</span>
        </button>
        <button
          aria-expanded={isHistoryOpen}
          className={`chat-page__rail-item${isHistoryOpen ? " chat-page__rail-item--active" : ""}`}
          type="button"
          onClick={() => setIsHistoryOpen((current) => !current)}
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            history
          </span>
          <span>历史会话</span>
        </button>
        <button className="chat-page__rail-item" type="button">
          <span aria-hidden="true" className="material-symbols-outlined">
            star
          </span>
          <span>收藏场景</span>
        </button>
        <button className="chat-page__rail-item" type="button">
          <span aria-hidden="true" className="material-symbols-outlined">
            settings
          </span>
          <span>个人设置</span>
        </button>
        <NavLink className="chat-page__rail-item chat-page__rail-item--admin" to="/admin">
          <span aria-hidden="true" className="material-symbols-outlined">
            admin_panel_settings
          </span>
          <span>管理后台</span>
        </NavLink>
      </aside>

      <main className="chat-page__main">
        <div aria-hidden="true" className="chat-page__glow chat-page__glow--primary" />
        <div aria-hidden="true" className="chat-page__glow chat-page__glow--secondary" />
        {isHistoryOpen ? (
          <section className="chat-page__history-panel glass-surface--strong" aria-label="历史会话列表">
            <div className="chat-page__history-panel-header">
              <h2>历史会话</h2>
              <span>{historyEntries.length} 条</span>
            </div>
            {historyError ? <p className="chat-page__history-empty">{historyError}</p> : null}
            {isHistoryLoading ? <p className="chat-page__history-empty">正在加载历史会话...</p> : null}
            {!isHistoryLoading && !historyError && historyEntries.length > 0 ? (
              <div className="chat-page__history-list">
                {historyEntries.map((entry) => (
                  <button
                    key={entry.session_id}
                    className={`chat-page__history-item${
                      sessionId === entry.session_id ? " is-active" : ""
                    }`}
                    type="button"
                    onClick={() => void handleOpenConversation(entry.session_id)}
                  >
                    <strong>{entry.title}</strong>
                    <span>{formatHistoryTimestamp(entry.updated_at)}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {!isHistoryLoading && !historyError && historyEntries.length === 0 ? (
              <p className="chat-page__history-empty">还没有历史会话，先发起一轮新对话。</p>
            ) : null}
          </section>
        ) : null}
        <div className="chat-page__content">
          <ChatShell
            title={title}
            description={description}
            errorMessage={error}
            composer={composer}
            conversationViewportRef={conversationViewportRef}
            conversation={
              hasConversation ? (
                <div className="conversation">
                  {messages.map((message) => {
                    const text =
                      getMessageText(message) ||
                      (message.role === "assistant" && isStreaming ? "正在生成回复..." : "");
                    const files = getMessageFiles(message);

                    return (
                      <article
                        key={message.id}
                        className={`conversation__message conversation__message--${message.role}`}
                      >
                        <span>{message.role === "user" ? "你" : "Polaris"}</span>
                        {files.length > 0 ? (
                          <div className="conversation__attachments">
                            {files.map((file) => (
                              <div
                                key={`${message.id}-${file.filename ?? file.url}`}
                                className="conversation__attachment"
                              >
                                <span aria-hidden="true" className="material-symbols-outlined">
                                  attachment
                                </span>
                                <span>{file.filename ?? "附件"}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {text ? (
                          message.role === "assistant" ? (
                            <MarkdownMessage content={text} />
                          ) : (
                            <p>{text}</p>
                          )
                        ) : null}
                      </article>
                    );
                  })}
                  <div ref={conversationBottomRef} className="conversation__bottom-anchor" />
                </div>
              ) : null
            }
            emptyHint="从一个需求、一段客户笔记或一份会议纪要开始。"
            mode={hasConversation ? "conversation" : "landing"}
            onConversationScroll={updateAutoScrollState}
            suggestions={!hasConversation ? <SuggestionChips onSelect={setInput} /> : null}
          />
        </div>
      </main>
    </div>
  );
}

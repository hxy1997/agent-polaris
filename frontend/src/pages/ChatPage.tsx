import { useState } from "react";

import { ChatShell } from "../components/chat/ChatShell";
import { Composer } from "../components/chat/Composer";
import { SuggestionChips } from "../components/chat/SuggestionChips";
import { useChatSession } from "../hooks/useChatSession";
import { useScenes } from "../hooks/useScenes";
import "../styles/chat.css";

export function ChatPage() {
  const { data: scenes = [] } = useScenes();
  const { isStreaming, messages, sendMessage } = useChatSession();
  const [draft, setDraft] = useState("");
  const activeScene = scenes[0];
  const title = activeScene?.name ?? "Loading scene";
  const description = activeScene
    ? "Read customer context, organize needs, and turn raw notes into crisp business answers."
    : "Loading the latest published scene configuration.";

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
      conversation={
        <div className="conversation">
          {messages.length === 0 ? (
            <div className="conversation__empty">
              <p>Start with a prompt, a rough customer note, or a meeting summary.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`conversation__message conversation__message--${message.role}`}>
                <span>{message.role === "user" ? "You" : "Polaris"}</span>
                <p>{message.content || (isStreaming ? "Streaming response..." : "")}</p>
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
          placeholder="Enter a request, customer notes, or product context"
          value={draft}
        />
      }
      suggestions={<SuggestionChips />}
    />
  );
}

import { startTransition, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { createChatSession, postChatMessage, streamChatSession } from "../lib/api";

export type ChatMessage = {
  content: string;
  role: "assistant" | "user";
};

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const createSessionMutation = useMutation({
    mutationFn: createChatSession
  });

  async function sendMessage(sceneId: string, content: string) {
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const session = await createSessionMutation.mutateAsync(sceneId);
      activeSessionId = session.session_id;
      setSessionId(activeSessionId);
    }

    setMessages((current) => [
      ...current,
      { content, role: "user" },
      { content: "", role: "assistant" }
    ]);
    setIsStreaming(true);

    await postChatMessage(activeSessionId, content);

    let assistantDraft = "";
    await streamChatSession(activeSessionId, (chunk) => {
      assistantDraft += chunk;
      startTransition(() => {
        setMessages((current) => {
          const next = [...current];
          next[next.length - 1] = { content: assistantDraft, role: "assistant" };
          return next;
        });
      });
    });

    setIsStreaming(false);
  }

  return {
    isStreaming,
    messages,
    sendMessage,
    sessionId
  };
}

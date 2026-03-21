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
  const [error, setError] = useState<string | null>(null);
  const createSessionMutation = useMutation({
    mutationFn: createChatSession
  });

  async function sendMessage(sceneId: string, content: string) {
    setError(null);
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
    try {
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
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "发送消息时发生未知错误";
      setError(message);
      setMessages((current) => {
        const next = [...current];
        if (next[next.length - 1]?.role === "assistant") {
          next[next.length - 1] = { content: message, role: "assistant" };
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return {
    error,
    isStreaming,
    messages,
    sendMessage,
    sessionId
  };
}

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";

import { createClientId } from "../lib/createClientId";
import { DEFAULT_CHAT_USER_ID } from "../lib/api";
import { PolarisChatTransport } from "../lib/polarisChatTransport";

type PendingSubmission = {
  draft: string;
  messageId: string;
  receivedAssistantChunk: boolean;
};

type UseChatSessionOptions = {
  sceneId?: string;
  userId?: string;
};

export function useChatSession({ sceneId, userId = DEFAULT_CHAT_USER_ID }: UseChatSessionOptions) {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sceneIdRef = useRef(sceneId);
  const sessionIdRef = useRef<string | null>(null);
  const userIdRef = useRef(userId);
  const pendingSubmissionRef = useRef<PendingSubmission | null>(null);
  const transportRef = useRef(
    new PolarisChatTransport({
      getSceneId: () => sceneIdRef.current,
      getSessionId: () => sessionIdRef.current,
      getUserId: () => userIdRef.current,
      setSessionId: (nextSessionId) => {
        sessionIdRef.current = nextSessionId;
        setSessionId(nextSessionId);
      },
      onResponseStart: () => {
        if (pendingSubmissionRef.current) {
          pendingSubmissionRef.current.receivedAssistantChunk = true;
        }
      }
    })
  );

  sceneIdRef.current = sceneId;
  sessionIdRef.current = sessionId;
  userIdRef.current = userId;

  const { clearError, error, messages, sendMessage, setMessages, status } = useChat<UIMessage>({
    onError: () => {
      const pendingSubmission = pendingSubmissionRef.current;
      if (pendingSubmission && !pendingSubmission.receivedAssistantChunk) {
        setInput(pendingSubmission.draft);
        setMessages((currentMessages) =>
          currentMessages.filter((message) => message.id !== pendingSubmission.messageId)
        );
      }

      pendingSubmissionRef.current = null;
    },
    onFinish: () => {
      pendingSubmissionRef.current = null;
    },
    transport: transportRef.current
  });

  useEffect(() => {
    pendingSubmissionRef.current = null;
    sessionIdRef.current = null;
    setSessionId(null);
    setInput("");
    setMessages([]);
    clearError();
  }, [sceneId, userId]);

  function startNewSession() {
    pendingSubmissionRef.current = null;
    sessionIdRef.current = null;
    setSessionId(null);
    setInput("");
    setMessages([]);
    clearError();
  }

  function restoreSession(nextSessionId: string, nextMessages: UIMessage[]) {
    pendingSubmissionRef.current = null;
    sessionIdRef.current = nextSessionId;
    setSessionId(nextSessionId);
    setInput("");
    setMessages(nextMessages);
    clearError();
  }

  async function submitInput(overrideInput?: string) {
    const nextValue = (overrideInput ?? input).trim();
    if (!sceneId || !nextValue || status === "submitted" || status === "streaming") {
      return;
    }

    const messageId = createClientId("user");
    pendingSubmissionRef.current = {
      draft: nextValue,
      messageId,
      receivedAssistantChunk: false
    };
    setInput("");

    await sendMessage({
      id: messageId,
      parts: [{ type: "text", text: nextValue }],
      role: "user"
    });
  }

  return {
    error: error?.message ?? null,
    input,
    isStreaming: status === "submitted" || status === "streaming",
    messages,
    restoreSession,
    sendMessage: submitInput,
    sessionId,
    userId,
    setInput,
    startNewSession,
    status
  };
}

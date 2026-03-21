import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

import { createChatSession, postChatMessage, streamChatSession } from "./api";
import { createClientId } from "./createClientId";

type PolarisChatTransportOptions = {
  getSceneId: () => string | undefined;
  getSessionId: () => string | null;
  getUserId: () => string;
  setSessionId: (sessionId: string) => void;
  onResponseStart?: () => void;
};

function extractTextContent(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<UIMessage["parts"][number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function containsUnsupportedFiles(message: UIMessage): boolean {
  return message.parts.some((part) => part.type === "file");
}

export class PolarisChatTransport<UI_MESSAGE extends UIMessage = UIMessage>
  implements ChatTransport<UI_MESSAGE>
{
  private readonly getSceneId: PolarisChatTransportOptions["getSceneId"];
  private readonly getSessionId: PolarisChatTransportOptions["getSessionId"];
  private readonly getUserId: PolarisChatTransportOptions["getUserId"];
  private readonly setSessionId: PolarisChatTransportOptions["setSessionId"];
  private readonly onResponseStart: PolarisChatTransportOptions["onResponseStart"];

  constructor(options: PolarisChatTransportOptions) {
    this.getSceneId = options.getSceneId;
    this.getSessionId = options.getSessionId;
    this.getUserId = options.getUserId;
    this.setSessionId = options.setSessionId;
    this.onResponseStart = options.onResponseStart;
  }

  async sendMessages({
    messages,
    abortSignal,
    trigger
  }: Parameters<ChatTransport<UI_MESSAGE>["sendMessages"]>[0]): Promise<ReadableStream<UIMessageChunk>> {
    const sceneId = this.getSceneId();
    const userId = this.getUserId();
    if (!sceneId) {
      throw new Error("Scene is not ready");
    }

    const sourceMessage =
      trigger === "regenerate-message"
        ? [...messages].reverse().find((message) => message.role === "user")
        : messages[messages.length - 1];

    if (!sourceMessage || sourceMessage.role !== "user") {
      throw new Error("A user message is required before requesting a response");
    }

    if (containsUnsupportedFiles(sourceMessage)) {
      throw new Error("附件发送能力尚未接入当前后端");
    }

    const content = extractTextContent(sourceMessage);
    if (!content) {
      throw new Error("消息内容不能为空");
    }

    let sessionId = this.getSessionId();
    if (!sessionId) {
      const session = await createChatSession(sceneId, userId, { signal: abortSignal });
      sessionId = session.session_id;
      this.setSessionId(sessionId);
    }

    await postChatMessage(sessionId, content, userId, { signal: abortSignal });

    const streamId = createClientId("assistant");
    const onResponseStart = this.onResponseStart;

    return new ReadableStream<UIMessageChunk>({
      async start(controller) {
        let started = false;

        try {
          await streamChatSession(
            sessionId,
            (chunk) => {
              if (!started) {
                started = true;
                onResponseStart?.();
                controller.enqueue({ type: "text-start", id: streamId });
              }

              controller.enqueue({ type: "text-delta", id: streamId, delta: chunk });
            },
            abortSignal
          );

          if (!started) {
            controller.enqueue({ type: "text-start", id: streamId });
          }

          controller.enqueue({ type: "text-end", id: streamId });
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}

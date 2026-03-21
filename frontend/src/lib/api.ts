export type SceneSummary = {
  id: string;
  name: string;
};

export type SceneDetail = {
  id: string;
  name: string;
  description: string;
  base_scene_id: string | null;
  system_prompt: string;
  base_url: string;
  model_name: string;
};

export type SceneConfigUpdate = {
  base_url: string;
  model_name: string;
};

export type CreateScenePayload = {
  name: string;
  scene_id: string;
  base_scene_id: string;
  description: string;
};

export type SceneMetadataUpdate = {
  name: string;
  description: string;
};

export type ScenePromptUpdate = {
  system_prompt: string;
};

export type ChatSessionResponse = {
  session_id: string;
  scene_id: string;
  user_id?: string | null;
};

export type ChatMessageResponse = {
  session_id: string;
  status: string;
};

export type ChatHistoryEntry = {
  session_id: string;
  scene_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatSessionMessage = {
  role: "assistant" | "user";
  content: string;
};

export type ChatSessionMessagesResponse = {
  session_id: string;
  scene_id: string;
  user_id: string;
  messages: ChatSessionMessage[];
};

export const DEFAULT_CHAT_USER_ID = "0000";

async function buildRequestError(response: Response, url: string): Promise<Error> {
  try {
    const payload = (await response.json()) as { detail?: string };
    if (payload.detail) {
      return new Error(payload.detail);
    }
  } catch {
    // Fall back to a generic message when the response is not JSON.
  }

  return new Error(`Request failed for ${url}`);
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw await buildRequestError(response, url);
  }

  return response.json() as Promise<T>;
}

export async function listScenes(): Promise<SceneSummary[]> {
  return requestJson<SceneSummary[]>("/api/chat/scenes");
}

export async function listAdminScenes(): Promise<SceneSummary[]> {
  return requestJson<SceneSummary[]>("/api/admin/scenes");
}

export async function listBaseScenes(): Promise<SceneSummary[]> {
  return requestJson<SceneSummary[]>("/api/admin/base-scenes");
}

export async function getAdminScene(sceneId: string): Promise<SceneDetail> {
  return requestJson<SceneDetail>(`/api/admin/scenes/${sceneId}`);
}

export async function updateAdminScene(
  sceneId: string,
  payload: SceneConfigUpdate
): Promise<SceneDetail> {
  return requestJson<SceneDetail>(`/api/admin/scenes/${sceneId}`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PUT"
  });
}

export async function createAdminScene(payload: CreateScenePayload): Promise<SceneDetail> {
  return requestJson<SceneDetail>("/api/admin/scenes", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function updateAdminSceneMetadata(
  sceneId: string,
  payload: SceneMetadataUpdate
): Promise<SceneDetail> {
  return requestJson<SceneDetail>(`/api/admin/scenes/${sceneId}/metadata`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PUT"
  });
}

export async function updateAdminScenePrompt(
  sceneId: string,
  payload: ScenePromptUpdate
): Promise<SceneDetail> {
  return requestJson<SceneDetail>(`/api/admin/scenes/${sceneId}/prompt`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PUT"
  });
}

export async function createChatSession(
  sceneId: string,
  userId: string,
  init?: RequestInit
): Promise<ChatSessionResponse> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  return requestJson<ChatSessionResponse>("/api/chat/sessions", {
    ...init,
    body: JSON.stringify({ scene_id: sceneId, user_id: userId }),
    headers,
    method: "POST"
  });
}

export async function postChatMessage(
  sessionId: string,
  content: string,
  userId: string,
  init?: RequestInit
): Promise<ChatMessageResponse> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  return requestJson<ChatMessageResponse>(`/api/chat/sessions/${sessionId}/messages`, {
    ...init,
    body: JSON.stringify({ content, user_id: userId }),
    headers,
    method: "POST"
  });
}

export async function listChatHistory(
  sceneId: string,
  userId: string,
  init?: RequestInit
): Promise<ChatHistoryEntry[]> {
  const query = new URLSearchParams({
    scene_id: sceneId,
    user_id: userId
  });

  return requestJson<ChatHistoryEntry[]>(`/api/chat/history?${query.toString()}`, init);
}

export async function getChatSessionMessages(
  sessionId: string,
  userId: string,
  init?: RequestInit
): Promise<ChatSessionMessagesResponse> {
  const query = new URLSearchParams({
    user_id: userId
  });

  return requestJson<ChatSessionMessagesResponse>(
    `/api/chat/sessions/${sessionId}/messages?${query.toString()}`,
    init
  );
}

export async function streamChatSession(
  sessionId: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`/api/chat/sessions/${sessionId}/stream`, { signal });
  if (!response.ok || !response.body) {
    throw new Error("Unable to stream chat response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event
        .split("\n")
        .find((eventLine) => eventLine.startsWith("data: "));

      if (!line) {
        continue;
      }

      const payload = JSON.parse(line.slice(6)) as { chunk: string };
      onChunk(payload.chunk);
    }
  }
}

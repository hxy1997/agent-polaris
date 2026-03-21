export type SceneSummary = {
  id: string;
  name: string;
};

export type SceneDetail = {
  id: string;
  name: string;
  base_url: string;
  model_name: string;
};

export type SceneConfigUpdate = {
  base_url: string;
  model_name: string;
};

export type ChatSessionResponse = {
  session_id: string;
  scene_id: string;
};

export type ChatMessageResponse = {
  session_id: string;
  status: string;
};

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

export async function createChatSession(sceneId: string): Promise<ChatSessionResponse> {
  return requestJson<ChatSessionResponse>("/api/chat/sessions", {
    body: JSON.stringify({ scene_id: sceneId }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function postChatMessage(
  sessionId: string,
  content: string
): Promise<ChatMessageResponse> {
  return requestJson<ChatMessageResponse>(`/api/chat/sessions/${sessionId}/messages`, {
    body: JSON.stringify({ content }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function streamChatSession(
  sessionId: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`/api/chat/sessions/${sessionId}/stream`);
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

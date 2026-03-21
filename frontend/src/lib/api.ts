export type SceneSummary = {
  id: string;
  name: string;
};

export type ChatSessionResponse = {
  session_id: string;
  scene_id: string;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
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

export async function createChatSession(sceneId: string): Promise<ChatSessionResponse> {
  return requestJson<ChatSessionResponse>("/api/chat/sessions", {
    body: JSON.stringify({ scene_id: sceneId }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminScene,
  getAdminScene,
  listAdminScenes,
  listBaseScenes,
  listScenes,
  type CreateScenePayload,
  type SceneConfigUpdate,
  type SceneMetadataUpdate,
  type ScenePromptUpdate,
  updateAdminSceneMetadata,
  updateAdminScenePrompt,
  updateAdminScene
} from "../lib/api";

export function useScenes(scope: "chat" | "admin" = "chat") {
  return useQuery({
    queryKey: ["scenes", scope],
    queryFn: scope === "chat" ? listScenes : listAdminScenes
  });
}

export function useBaseScenes() {
  return useQuery({
    queryKey: ["base-scenes"],
    queryFn: listBaseScenes
  });
}

export function useSceneDetail(sceneId: string | null) {
  return useQuery({
    queryKey: ["admin-scene", sceneId],
    queryFn: () => getAdminScene(sceneId ?? ""),
    enabled: Boolean(sceneId)
  });
}

export function useUpdateSceneDetail(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SceneConfigUpdate) => updateAdminScene(sceneId ?? "", payload),
    onSuccess: (scene) => {
      queryClient.setQueryData(["admin-scene", scene.id], scene);
    }
  });
}

export function useCreateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScenePayload) => createAdminScene(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scenes", "admin"] });
    }
  });
}

export function useUpdateSceneMetadata(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SceneMetadataUpdate) => updateAdminSceneMetadata(sceneId ?? "", payload),
    onSuccess: (scene) => {
      queryClient.setQueryData(["admin-scene", scene.id], scene);
      void queryClient.invalidateQueries({ queryKey: ["scenes", "admin"] });
    }
  });
}

export function useUpdateScenePrompt(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScenePromptUpdate) => updateAdminScenePrompt(sceneId ?? "", payload),
    onSuccess: (scene) => {
      queryClient.setQueryData(["admin-scene", scene.id], scene);
    }
  });
}

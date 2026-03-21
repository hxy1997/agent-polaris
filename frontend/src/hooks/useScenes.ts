import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminScene,
  listAdminScenes,
  listBaseScenes,
  listScenes,
  type SceneConfigUpdate,
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

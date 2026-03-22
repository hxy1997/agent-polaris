import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  copyAdminSkillFromBase,
  createAdminScene,
  createAdminSkill,
  createAdminSkillDirectory,
  createAdminSkillFile,
  deleteAdminSkillNode,
  getAdminScene,
  getAdminSkillFile,
  getAdminSkillTree,
  listAdminScenes,
  listBaseScenes,
  listScenes,
  type CreateScenePayload,
  type CreateSkillNodePayload,
  type CreateSkillPayload,
  type CopySkillFromBasePayload,
  type RenameSkillNodePayload,
  type SceneConfigUpdate,
  type SceneMetadataUpdate,
  type ScenePromptUpdate,
  type UpdateSkillFilePayload,
  type UploadSkillDirectoryPayload,
  renameAdminSkillNode,
  updateAdminSceneMetadata,
  updateAdminScenePrompt,
  updateAdminScene,
  updateAdminSkillFile,
  uploadAdminSkillDirectory
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

export function useSkillTree(sceneId: string | null) {
  return useQuery({
    queryKey: ["admin-scene-skills", sceneId],
    queryFn: () => getAdminSkillTree(sceneId ?? ""),
    enabled: Boolean(sceneId)
  });
}

export function useSkillFile(
  sceneId: string | null,
  source: "base" | "scene" | null,
  path: string | null
) {
  return useQuery({
    queryKey: ["admin-scene-skill-file", sceneId, source, path],
    queryFn: () => getAdminSkillFile(sceneId ?? "", source ?? "scene", path ?? ""),
    enabled: Boolean(sceneId && source && path)
  });
}

function invalidateSkillQueries(queryClient: ReturnType<typeof useQueryClient>, sceneId: string | null) {
  void queryClient.invalidateQueries({ queryKey: ["admin-scene-skills", sceneId] });
}

export function useCreateSkill(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSkillPayload) => createAdminSkill(sceneId ?? "", payload),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useCreateSkillFile(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSkillNodePayload) => createAdminSkillFile(sceneId ?? "", payload),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useCreateSkillDirectory(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSkillNodePayload) => createAdminSkillDirectory(sceneId ?? "", payload),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useCopySkillFromBase(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CopySkillFromBasePayload) => copyAdminSkillFromBase(sceneId ?? "", payload),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useUploadSkillDirectory(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadSkillDirectoryPayload) => uploadAdminSkillDirectory(sceneId ?? "", payload),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useUpdateSkillFile(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSkillFilePayload) => updateAdminSkillFile(sceneId ?? "", payload),
    onSuccess: (file) => {
      queryClient.setQueryData(["admin-scene-skill-file", sceneId, "scene", file.path], file);
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useRenameSkillNode(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RenameSkillNodePayload) => renameAdminSkillNode(sceneId ?? "", payload),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

export function useDeleteSkillNode(sceneId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (path: string) => deleteAdminSkillNode(sceneId ?? "", path),
    onSuccess: () => {
      invalidateSkillQueries(queryClient, sceneId);
    }
  });
}

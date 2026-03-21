import { useQuery } from "@tanstack/react-query";

import { listAdminScenes, listBaseScenes, listScenes } from "../lib/api";

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

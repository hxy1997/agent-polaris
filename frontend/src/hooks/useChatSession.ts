import { useMutation } from "@tanstack/react-query";

import { createChatSession } from "../lib/api";

export function useChatSession() {
  return useMutation({
    mutationFn: createChatSession
  });
}

// hooks/chat/queries.ts

import { useCallback } from "react";
import { ChatService } from "@/services/chatService";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeSync } from "@/hooks/utils/useRealtimeSync";

export const chatKeys = {
  all: ["chat"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  province: (id: number) => [...chatKeys.lists(), "province", id] as const,
  global: () => [...chatKeys.lists(), "global"] as const,
};

export const useChatMessages = (provinciaId?: number) => {
  const queryKey = provinciaId ? chatKeys.province(provinciaId) : chatKeys.global();

  // Initially fetch messages
  const query = useQuery({
    queryKey,
    queryFn: () =>
      provinciaId
        ? ChatService.fetchChatMessages(provinciaId)
        : ChatService.fetchGlobalChatMessages(),
    staleTime: Infinity,
  });

  const subscribeFn = useCallback(
    (callback: (payload: any) => void) =>
      provinciaId
        ? ChatService.subscribeToChatMessages(provinciaId, callback)
        : ChatService.subscribeToGlobalChat(callback),
    [provinciaId]
  );

  // Set up real-time subscription for new messages
  useRealtimeSync({
    queryKey,
    subscribeFn,
  });

  return query;
};

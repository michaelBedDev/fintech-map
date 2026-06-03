import { ChatService } from "@/services/chatService";
import type { SendMessagePayload } from "@/types/DTOs/dtos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "./queries";
import { toast } from "sonner";

/**
 * Hook to send messages.
 * We rely on the Realtime subscription in useChatMessages
 * but also invalidate the query cache on success to ensure
 * instantaneous local updates ("en caliente").
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const result = await ChatService.sendChatMessage(payload);

      if (!result.success) {
        throw new Error(result.error ?? "No se pudo enviar el mensaje");
      }

      return result;
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: variables.provinciaId
          ? chatKeys.province(variables.provinciaId)
          : chatKeys.global(),
      });
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error: No se pudo enviar el mensaje. ${message}`);
    },
  });
}

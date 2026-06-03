import { ChatService } from "@/services/chatService";
import type { SendMessagePayload } from "@/types/DTOs/dtos";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook to send messages.
 * We rely on the Realtime subscription in useChatMessages
 * to update the UI once the database confirms the insert.
 */
export function useSendMessage() {
  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const result = await ChatService.sendChatMessage(payload);

      if (!result.success) {
        throw new Error(result.error ?? "No se pudo enviar el mensaje");
      }

      return result;
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error: No se pudo enviar el mensaje. ${message}`);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "@/services/profileService";
import { profileKeys } from "./queries";
import type { UserMarker } from "@/types/DTOs/dtos";
import { toast } from "sonner";

/** Hook para cambiar la provincia del usuario */
export const useUpdateProvince = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, provinciaId }: { userId: string; provinciaId: number }) => {
      const res = await ProfileService.setUserProvince(userId, provinciaId);
      if (!res.success) {
        throw new Error(res.error ?? "No se pudo actualizar la provincia");
      }
      return res;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.userId),
      });
    },
  });
};

/** Hook para actualizar la posición del marcador en el mapa */
export const useUpdateMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userMarker: UserMarker) => {
      const res = await ProfileService.setUserMarkerPosition(userMarker);
      if (!res.success) {
        throw new Error(res.error ?? "No se pudo guardar la posición");
      }
      return res;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.userId),
      });
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });
};

/** Hook para eliminar la cuenta permanentemente */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await ProfileService.deleteMyAccount();
      if (!res.success) {
        throw new Error(res.error ?? "No se pudo eliminar la cuenta");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: Error) => {
      toast.error(`No se pudo eliminar la cuenta. ${error.message}`);
    },
  });
};

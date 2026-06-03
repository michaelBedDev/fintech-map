import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as AuthService from "@/services/auth/authService";
import { authKeys } from "./queries"; // Importamos tus llaves
import { toast } from "sonner";

/**
 * Hook to handle OAuth Sign In.
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: AuthService.handleSignIn,
    onError: (error: Error) => {
      toast.error(`No se pudo iniciar sesion. ${error.message}`);
    },
  });
};

/**
 * Hook to handle Sign Out.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.handleSignOut,
    onSuccess: () => {
      // Limpiamos toda la cache para evitar datos stale de usuario.
      queryClient.clear();
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`No se pudo cerrar sesion. ${error.message}`);
    },
  });
};

import * as AuthService from "@/services/auth/authService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

/**
 * Hook to get the current auth session.
 */
export const useAuthSession = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: () => AuthService.getSession(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = AuthService.subscribeToAuthChanges((_event, session) => {
      queryClient.setQueryData(authKeys.session(), session);
    });

    return unsubscribe;
  }, [queryClient]);

  return query;
};

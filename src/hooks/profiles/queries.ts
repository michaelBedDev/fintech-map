import { useQuery } from "@tanstack/react-query";
import { ProfileService } from "@/services/profileService";

export const profileKeys = {
  all: ["profiles"] as const,
  lists: () => [...profileKeys.all, "list"] as const,
  count: () => [...profileKeys.all, "count"] as const,
  detail: (userId: string) => [...profileKeys.all, "detail", userId] as const,
};

/** Hook para obtener la lista de perfiles */
export const useProfiles = () => {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: () => ProfileService.fetchAllProfiles(),
    staleTime: 1000 * 60 * 5, // Considerar datos "frescos" por 5 min
  });
};

/** Hook para el contador total */
export const useUserCount = () => {
  return useQuery({
    queryKey: profileKeys.count(),
    queryFn: () => ProfileService.fetchUserCount(),
  });
};

export const useMyProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: profileKeys.detail(userId || ""),
    queryFn: () => ProfileService.fetchMyProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
};

import { useQuery } from "@tanstack/react-query";
import { LocationService } from "@/services/locationService";

export const locationKeys = {
  all: ["location"] as const,
  provinces: () => [...locationKeys.all, "provinces"] as const,
  byName: (name: string) => [...locationKeys.provinces(), "by-name", name] as const,
};

/**
 * Hook to get a province ID by its name.
 * We use a long staleTime because province IDs almost never change.
 */
export const useProvinciaId = (nombre: string | undefined) => {
  return useQuery({
    queryKey: locationKeys.byName(nombre || ""),
    queryFn: () => LocationService.fetchProvinciaIdByName(nombre!),
    enabled: !!nombre && nombre.length > 2,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

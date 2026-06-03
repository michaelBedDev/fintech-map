import { useQuery } from "@tanstack/react-query";
import { MapService } from "@/services/mapService";

export const mapKeys = {
  all: ["maps"] as const,
  provinces: () => [...mapKeys.all, "provinces"] as const,
  combined: () => [...mapKeys.provinces(), "combined"] as const,
};

export const useMapData = () => {
  return useQuery({
    queryKey: mapKeys.combined(),
    queryFn: () => MapService.fetchCombinedProvinces(),
    staleTime: Infinity,
  });
};

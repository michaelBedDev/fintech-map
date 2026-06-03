import { useMemo, useState, useRef, useCallback } from "react";
import type { DragEndEvent, Layer, Marker } from "leaflet";
import type { Feature, Geometry } from "geojson";
import { useMapData } from "./queries";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { toast } from "sonner";

import type { ProfileWithProvince } from "@/types/DTOs/dtos";
import { getProvinceName, featureCentroid } from "@/utils/map-utils";

type AvatarMarkerData = {
  key: string;
  position: [number, number];
  profile: ProfileWithProvince;
};

interface HoveredLayerRef {
  layer: Layer;
  name: string;
}

interface UseSelectedMapParams {
  profiles: ProfileWithProvince[];
  selectedProvince: string | null;
  onMarkerDrag?: (lat: number, lng: number) => void;
}

export function useSelectedMap(params: UseSelectedMapParams) {
  const { profiles, selectedProvince, onMarkerDrag } = params;
  const [hovered, setHovered] = useState<string | null>(null);
  const prevHoveredRef = useRef<HoveredLayerRef | null>(null);

  const { data: geoData, isLoading, error } = useMapData();

  const profilesByProvince = useMemo(() => {
    const map = new Map<string, ProfileWithProvince[]>();

    for (const profile of profiles) {
      const provinceName = profile.provincias?.nombre;
      if (!provinceName) continue;

      const provinceProfiles = map.get(provinceName) ?? [];
      provinceProfiles.push(profile);
      map.set(provinceName, provinceProfiles);
    }

    return map;
  }, [profiles]);

  const occupiedProvinces = useMemo(
    () => new Set(profilesByProvince.keys()),
    [profilesByProvince],
  );

  const provinceCentroids = useMemo(() => {
    if (!geoData) return new Map<string, [number, number]>();

    const map = new Map<string, [number, number]>();
    for (const feature of geoData.features) {
      map.set(
        getProvinceName(feature as Feature<Geometry>),
        featureCentroid(feature),
      );
    }

    return map;
  }, [geoData]);

  const avatarMarkers = useMemo(() => {
    const markers: AvatarMarkerData[] = [];

    for (const [provinceName, provinceProfiles] of profilesByProvince) {
      const center = provinceCentroids.get(provinceName);
      if (!center) continue;

      const withCustomPosition = provinceProfiles.filter(
        (profile) => profile.marker_lat != null && profile.marker_lng != null,
      );
      const withoutCustomPosition = provinceProfiles.filter(
        (profile) => profile.marker_lat == null || profile.marker_lng == null,
      );

      for (const p of withCustomPosition) {
        markers.push({
          key: p.id,
          position: [p.marker_lat!, p.marker_lng!],
          profile: p,
        });
      }

      const count = withoutCustomPosition.length;
      withoutCustomPosition.forEach((profile, index) => {
        let [lat, lng] = center;

        if (count > 1) {
          const angle = (2 * Math.PI * index) / count;
          const radius = Math.min(0.15 + count * 0.02, 0.5);
          lat += Math.cos(angle) * radius;
          lng += Math.sin(angle) * radius;
        }

        markers.push({ key: profile.id, position: [lat, lng], profile });
      });
    }

    return markers;
  }, [profilesByProvince, provinceCentroids]);

  const isPointInProvince = useCallback(
    (lat: number, lng: number, provinceName: string): boolean => {
      const feature = geoData?.features.find(
        (f) => getProvinceName(f as Feature<Geometry>) === provinceName,
      );

      if (!feature) return false;

      return booleanPointInPolygon(point([lng, lat]), feature as Feature<any>);
    },
    [geoData],
  );

  const handleMarkerDragEnd = useCallback(
    (e: DragEndEvent, previousPosition: [number, number]) => {
      if (!selectedProvince || !onMarkerDrag) return;

      const marker = e.target as Marker;
      const { lat, lng } = marker.getLatLng();

      if (isPointInProvince(lat, lng, selectedProvince)) {
        onMarkerDrag(lat, lng);
        toast.success("Posicion guardada");
        return;
      }

      marker.setLatLng(previousPosition);
      toast.error("La posicion debe estar dentro de tu provincia");
    },
    [selectedProvince, onMarkerDrag, isPointInProvince],
  );

  return {
    geoData,
    isLoading,
    error: error instanceof Error ? error.message : null,
    hovered,
    setHovered,
    avatarMarkers,
    profilesByProvince,
    occupiedProvinces,
    prevHoveredRef,
    handleMarkerDragEnd,
  };
}

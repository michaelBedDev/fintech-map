import { useCallback } from "react";
import type { Feature, Geometry } from "geojson";
import type { Layer, LeafletMouseEvent, Path } from "leaflet";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

import { useSelectedMap } from "@/hooks/map/useMap";
import { AvatarMarker } from "@/components/map/AvatarMarker";
import { MapOverlay } from "@/components/map/MapOverlay";
import { Spinner } from "@/components/animations/Spinner";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileWithProvince } from "@/types/DTOs/dtos";
import { getProvinceName, MAP_STYLES } from "@/utils/map-utils";
import "leaflet/dist/leaflet.css";

export interface SelectedMapProps {
  selectedProvince: string | null;
  onProvinceSelect: (provinceName: string) => void;
  profiles: ProfileWithProvince[];
  dialogOpen?: boolean;
  currentUserId?: string | null;
  onMarkerDrag?: (lat: number, lng: number) => void;
}

export function SelectedMap({
  selectedProvince,
  onProvinceSelect,
  profiles,
  dialogOpen = false,
  currentUserId = null,
  onMarkerDrag,
}: SelectedMapProps) {
  const map = useSelectedMap({ profiles, selectedProvince, onMarkerDrag });
  const hoveredProfiles = map.hovered
    ? (map.profilesByProvince.get(map.hovered) ?? [])
    : [];

  const styleFeature = useCallback(
    (feature: Feature<Geometry> | undefined) => {
      if (!feature) return MAP_STYLES.DEFAULT;

      const provinceName = getProvinceName(feature);
      if (provinceName === selectedProvince) return MAP_STYLES.SELECTED;
      if (map.occupiedProvinces.has(provinceName)) return MAP_STYLES.OCCUPIED;

      return MAP_STYLES.DEFAULT;
    },
    [selectedProvince, map.occupiedProvinces],
  );

  const onEachFeature = useCallback(
    (feature: Feature<Geometry>, layer: Layer) => {
      const provinceName = getProvinceName(feature);

      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          // Reset the previous hovered feature if mouseout did not fire.
          const previous = map.prevHoveredRef.current;
          if (previous && previous.layer !== layer) {
            if (previous.name !== selectedProvince) {
              (previous.layer as Path).setStyle(
                map.occupiedProvinces.has(previous.name)
                  ? MAP_STYLES.OCCUPIED
                  : MAP_STYLES.DEFAULT,
              );
            }
          }

          map.prevHoveredRef.current = { layer, name: provinceName };
          map.setHovered(provinceName);

          if (provinceName !== selectedProvince) {
            (e.target as Path).setStyle(MAP_STYLES.HOVER);
          }
          (e.target as Path).bringToFront();
        },
        mouseout: (e: LeafletMouseEvent) => {
          if (map.prevHoveredRef.current?.layer === layer) {
            map.prevHoveredRef.current = null;
          }

          map.setHovered(null);
          if (provinceName !== selectedProvince) {
            (e.target as Path).setStyle(
              map.occupiedProvinces.has(provinceName)
                ? MAP_STYLES.OCCUPIED
                : MAP_STYLES.DEFAULT,
            );
          }
        },
        click: () => {
          onProvinceSelect(provinceName);
        },
      });
    },
    [selectedProvince, onProvinceSelect, map.occupiedProvinces, map.setHovered],
  );

  if (map.error) {
    return (
      <Card className='border-destructive'>
        <CardContent className='py-8 text-center'>
          <p className='text-destructive text-sm'>
            Error al cargar el mapa: {map.error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (map.isLoading)
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='lg' />
      </div>
    );

  if (!map.geoData) {
    return null;
  }

  return (
    <div className='relative h-full w-full'>
      <MapOverlay provinceName={map.hovered} profiles={hoveredProfiles} />

      <MapContainer
        center={[40, -3.7]}
        zoom={5}
        minZoom={3}
        maxZoom={12}
        className='h-full w-full bg-background'
        attributionControl={false}
        zoomControl={true}>
        <TileLayer url='https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png' />

        <GeoJSON
          key={`${selectedProvince ?? "none"}-${map.occupiedProvinces.size}-${dialogOpen}`}
          data={map.geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />

        {map.avatarMarkers.map((m) => {
          const isCurrentUser = m.profile.id === currentUserId;
          return (
            <AvatarMarker
              key={m.key}
              profile={m.profile}
              position={m.position}
              isCurrentUser={isCurrentUser}
              onDragEnd={isCurrentUser ? map.handleMarkerDragEnd : undefined}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

export const SpainMap = SelectedMap;

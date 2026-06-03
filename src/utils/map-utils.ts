import L from "leaflet";
import type { PathOptions } from "leaflet";
import type { Feature, Geometry } from "geojson";

export const MAP_STYLES: Record<
  "DEFAULT" | "HOVER" | "SELECTED" | "OCCUPIED",
  PathOptions
> = {
  DEFAULT: {
    fillColor: "var(--color-map-idle)",
    weight: 1,
    opacity: 1,
    color: "var(--color-map-border)",
    fillOpacity: 0.7,
  },
  HOVER: {
    fillColor: "var(--color-map-hover)",
    fillOpacity: 0.45,
    weight: 2,
    color: "var(--color-map-hover)",
  },
  SELECTED: {
    fillColor: "var(--color-map-selected)",
    fillOpacity: 0.75,
    weight: 2.5,
    color: "var(--color-map-hover)",
  },
  OCCUPIED: {
    fillColor: "var(--color-map-occupied)",
    fillOpacity: 0.4,
    weight: 1,
    opacity: 1,
    color: "var(--color-map-occupied)",
  },
};

export function getProvinceName(feature: Feature<Geometry>): string {
  return (
    feature.properties?.name ??
    feature.properties?.NAME ??
    feature.properties?.provincia ??
    "Desconocida"
  );
}

export function featureCentroid(feature: Feature<Geometry>): [number, number] {
  const layer = L.geoJSON(feature);
  const bounds = layer.getBounds();
  const center = bounds.getCenter();
  return [center.lat, center.lng];
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getFallbackAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || "default")}`;
}

export function createAvatarIcon(
  avatarUrl: string | null,
  name: string,
  size = 28,
): L.DivIcon {
  const safeName = escapeHtml(name || "?");
  const fallbackUrl = getFallbackAvatar(name);
  const html = `<img src="${escapeHtml(avatarUrl || fallbackUrl)}" alt="${safeName}" class="avatar-marker" style="width:${size}px;height:${size}px;" onerror="this.onerror=null;this.src='${fallbackUrl}';" />`;

  return L.divIcon({
    html,
    className: "avatar-marker-container",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

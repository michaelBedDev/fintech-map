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

const FALLBACK_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#2563eb',
] as const;

export function getFallbackAvatar(seed: string): string {
  const safeSeed = seed || "default";
  const hash = safeSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
  const initial = safeSeed.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${color}"/><text x="50" y="50" text-anchor="middle" dy=".36em" fill="#fff" font-size="42" font-family="system-ui,sans-serif" font-weight="600">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getSafeAvatarUrl(avatarUrl: string | null, name: string): string {
  return avatarUrl || getFallbackAvatar(name);
}

export function createAvatarIcon(
  avatarUrl: string | null,
  name: string,
  size = 28,
): L.DivIcon {
  const safeName = escapeHtml(name || "?");
  const safeAvatarUrl = getSafeAvatarUrl(avatarUrl, name);
  const fallbackUrl = getFallbackAvatar(name);
  const html = `<img src="${escapeHtml(safeAvatarUrl)}" alt="${safeName}" class="avatar-marker" style="width:${size}px;height:${size}px;" onerror="this.onerror=null;this.src='${fallbackUrl}';" />`;

  return L.divIcon({
    html,
    className: "avatar-marker-container",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

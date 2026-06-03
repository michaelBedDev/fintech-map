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
  // Sanitize to ASCII letter — accented chars (Á, É…) break URI encoding
  const safeInitial = /^[A-Za-z0-9]$/.test(initial) ? initial : '?';
  // Single-quoted SVG attributes avoid escaping issues in HTML contexts.
  // Only '#' needs escaping in data: URIs (it's the fragment delimiter).
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='${color}'/><text x='50' y='50' text-anchor='middle' dy='.36em' fill='white' font-size='42' font-family='sans-serif' font-weight='600'>${safeInitial}</text></svg>`;
  return `data:image/svg+xml,${svg.replace(/#/g, '%23')}`;
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
  const imgSrc = avatarUrl
    ? escapeHtml(avatarUrl)
    : getFallbackAvatar(name);
  const fallbackUrl = getFallbackAvatar(name);
  // Data URIs use single-quoted SVG attrs, so they're safe inside double-quoted HTML attrs.
  // For onerror, wrap in double quotes since the data URI only contains single quotes.
  const html = `<img src="${imgSrc}" alt="${safeName}" class="avatar-marker" style="width:${size}px;height:${size}px;" onerror="this.onerror=null;this.src=&quot;${fallbackUrl}&quot;;" />`;

  return L.divIcon({
    html,
    className: "avatar-marker-container",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

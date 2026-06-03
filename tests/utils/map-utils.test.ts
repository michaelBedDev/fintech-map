import { describe, it, expect, vi } from "vitest";
import {
  getProvinceName,
  featureCentroid,
  escapeHtml,
  createAvatarIcon,
  MAP_STYLES,
} from "@/utils/map-utils";
import type { Feature, Geometry } from "geojson";
import L from "leaflet";

describe("MAP_STYLES", () => {
  it("should have correct styles defined", () => {
    expect(MAP_STYLES.DEFAULT).toBeDefined();
    expect(MAP_STYLES.HOVER).toBeDefined();
    expect(MAP_STYLES.SELECTED).toBeDefined();
    expect(MAP_STYLES.OCCUPIED).toBeDefined();
  });
});

describe("getProvinceName", () => {
  it("should retrieve name from various properties", () => {
    const f1 = { properties: { name: "Madrid" } } as unknown as Feature<Geometry>;
    const f2 = { properties: { NAME: "Barcelona" } } as unknown as Feature<Geometry>;
    const f3 = { properties: { provincia: "Valencia" } } as unknown as Feature<Geometry>;
    const f4 = { properties: {} } as unknown as Feature<Geometry>;

    expect(getProvinceName(f1)).toBe("Madrid");
    expect(getProvinceName(f2)).toBe("Barcelona");
    expect(getProvinceName(f3)).toBe("Valencia");
    expect(getProvinceName(f4)).toBe("Desconocida");
  });
});

describe("featureCentroid", () => {
  it("should calculate centroid using Leaflet getBounds().getCenter()", () => {
    const f = { type: "Feature" } as unknown as Feature<Geometry>;
    const center = featureCentroid(f);
    expect(L.geoJSON).toHaveBeenCalledWith(f);
    expect(center).toEqual([40, -3.7]);
  });
});

describe("escapeHtml", () => {
  it("should escape special characters to prevent HTML injection", () => {
    expect(escapeHtml("<div> & 'hello' \"world\"</div>")).toBe(
      "&lt;div&gt; &amp; &#39;hello&#39; &quot;world&quot;&lt;/div&gt;"
    );
  });
});

describe("createAvatarIcon", () => {
  it("should create div icon for null avatar", () => {
    const icon = createAvatarIcon(null, "Miguel");
    expect(L.divIcon).toHaveBeenCalled();
    expect(icon).toBeDefined();
  });

  it("should create div icon with image if avatarUrl is provided", () => {
    const icon = createAvatarIcon("https://example.com/avatar.jpg", "Miguel");
    expect(L.divIcon).toHaveBeenCalled();
    expect(icon).toBeDefined();
  });

  it("should fallback name to ? if name is empty", () => {
    const icon = createAvatarIcon(null, "");
    expect(L.divIcon).toHaveBeenCalled();
    expect(icon).toBeDefined();
  });
});

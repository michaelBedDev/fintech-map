import { describe, it, expect, vi } from "vitest";
import {
  getProvinceName,
  featureCentroid,
  escapeHtml,
  createAvatarIcon,
  MAP_STYLES,
  getSafeAvatarUrl,
  getFallbackAvatar,
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

describe("getSafeAvatarUrl & getFallbackAvatar", () => {
  it("should return an inline data URI SVG (not an external URL) to avoid loading flicker", () => {
    const fallback = getFallbackAvatar("Carlos");
    // Must be a data URI so the browser decodes it synchronously — no network, no flash
    expect(fallback).toMatch(/^data:image\/svg\+xml,/);
    expect(fallback).toContain("C"); // first initial
  });

  it("should return the exact same URL if it is a cached Supabase URL", () => {
    const cachedUrl = "https://xyz.supabase.co/storage/v1/object/public/avatars/u123/avatar.jpg";
    const result = getSafeAvatarUrl(cachedUrl, "Carlos");
    expect(result).toBe(cachedUrl);
  });

  it("should return the exact same URL if it is a Dicebear URL stored in DB", () => {
    const dicebearUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos";
    const result = getSafeAvatarUrl(dicebearUrl, "Carlos");
    expect(result).toBe(dicebearUrl);
  });

  it("should return the exact same URL if it is an external URL (e.g. Twitter)", () => {
    const twitterUrl = "https://pbs.twimg.com/profile_images/123/avatar.jpg";
    const result = getSafeAvatarUrl(twitterUrl, "Carlos");
    expect(result).toBe(twitterUrl);
  });

  it("should return a data URI fallback (not null/undefined) when avatar_url is null", () => {
    const result = getSafeAvatarUrl(null, "Carlos");
    expect(result).toMatch(/^data:image\/svg\+xml,/);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
  });

  it("should return a data URI fallback when avatar_url is empty string", () => {
    const result = getSafeAvatarUrl("", "Elena");
    expect(result).toMatch(/^data:image\/svg\+xml,/);
  });

  it("should return a stable fallback URL for the same seed (deterministic)", () => {
    const url1 = getFallbackAvatar("Miguel");
    const url2 = getFallbackAvatar("Miguel");
    expect(url1).toBe(url2);
  });

  it("should return different colors for different seeds", () => {
    const url1 = getFallbackAvatar("Ana");
    const url2 = getFallbackAvatar("Zoe");
    // Different names should produce different SVGs (different color at minimum)
    expect(url1).not.toBe(url2);
  });

  it("should use 'default' seed when given empty string", () => {
    const result = getFallbackAvatar("");
    expect(result).toMatch(/^data:image\/svg\+xml,/);
    expect(result).toContain("D"); // "Default" -> "D"
  });

  it("should sanitize accented initials to '?' to avoid malformed URI errors", () => {
    const result = getFallbackAvatar("Álvaro");
    expect(result).toMatch(/^data:image\/svg\+xml,/);
    // Á is non-ASCII, must be replaced with ? to avoid encoding issues
    expect(result).toContain(">?<");
  });

  it("should escape '#' in colors to '%23' for valid data URIs", () => {
    const result = getFallbackAvatar("Carlos");
    // '#' in color values must be escaped as %23 (fragment delimiter in URIs)
    expect(result).not.toContain("#");
    expect(result).toContain("%23");
  });
});

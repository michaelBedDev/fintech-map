import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MapService } from "@/services/mapService";

describe("MapService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("fetchCombinedProvinces", () => {
    it("should fetch and merge geojson features successfully", async () => {
      const mockSpain = { features: [{ id: 1, properties: { name: "Madrid" } }] };
      const mockAndorra = { features: [{ id: 2, properties: { name: "Andorra" } }] };

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("spain")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSpain),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAndorra),
        });
      }) as any;

      const result = await MapService.fetchCombinedProvinces();
      expect(result.type).toBe("FeatureCollection");
      expect(result.features).toHaveLength(2);
      expect(result.features[0].properties?.name).toBe("Madrid");
      expect(result.features[1].properties?.name).toBe("Andorra");
    });

    it("should throw error if fetch Spain fails", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("spain")) {
          return Promise.resolve({ ok: false });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ features: [] }) });
      }) as any;

      await expect(MapService.fetchCombinedProvinces()).rejects.toThrow(
        "Error loading Spain GeoJSON"
      );
    });

    it("should throw error if fetch Andorra fails", async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("andorra")) {
          return Promise.resolve({ ok: false });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ features: [] }) });
      }) as any;

      await expect(MapService.fetchCombinedProvinces()).rejects.toThrow(
        "Error loading Andorra GeoJSON"
      );
    });
  });
});

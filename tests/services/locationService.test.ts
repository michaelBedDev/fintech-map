import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocationService } from "@/services/locationService";
import { mockSupabase } from "../setup";

describe("LocationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchProvinciaIdByName", () => {
    it("should return the province ID if found", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 42 }, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const id = await LocationService.fetchProvinciaIdByName("Madrid");
      expect(mockSupabase.from).toHaveBeenCalledWith("provincias");
      expect(mockChain.select).toHaveBeenCalledWith("id");
      expect(mockChain.eq).toHaveBeenCalledWith("nombre", "Madrid");
      expect(id).toBe(42);
    });

    it("should log error and return null if query fails", async () => {
      const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const id = await LocationService.fetchProvinciaIdByName("Atlantis");
      expect(id).toBeNull();
      expect(consoleMock).toHaveBeenCalled();
      consoleMock.mockRestore();
    });

    it("should return null if query returns null data with no error", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const id = await LocationService.fetchProvinciaIdByName("Atlantis");
      expect(id).toBeNull();
    });
  });
});

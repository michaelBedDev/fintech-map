import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileService } from "@/services/profileService";
import { mockSupabase } from "../setup";

describe("ProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAllProfiles", () => {
    it("should fetch and normalize profiles successfully", async () => {
      const mockProfilesData = [
        { id: "1", full_name: "Miguel", provincias: [{ nombre: "Madrid" }] },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProfilesData, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const profiles = await ProfileService.fetchAllProfiles();
      expect(profiles).toHaveLength(1);
      expect(profiles[0].id).toBe("1");
      expect(profiles[0].provincias).toEqual({ nombre: "Madrid" });
    });
    it("should fetch and normalize profiles when provincias is not an array", async () => {
      const mockProfilesData = [
        { id: "1", full_name: "Miguel", provincias: { nombre: "Madrid" } },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProfilesData, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const profiles = await ProfileService.fetchAllProfiles();
      expect(profiles).toHaveLength(1);
      expect(profiles[0].provincias).toEqual({ nombre: "Madrid" });
    });
    it("should throw error if fetchAllProfiles query fails", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      await expect(ProfileService.fetchAllProfiles()).rejects.toThrow("DB Error");
    });
  });

  describe("fetchUserCount", () => {
    it("should return the exact count of profiles", async () => {
      const mockChain = {
        select: vi.fn().mockResolvedValue({ count: 15, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const count = await ProfileService.fetchUserCount();
      expect(count).toBe(15);
    });

    it("should return 0 if query returns null count with no error", async () => {
      const mockChain = {
        select: vi.fn().mockResolvedValue({ count: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const count = await ProfileService.fetchUserCount();
      expect(count).toBe(0);
    });

    it("should throw error if fetchUserCount fails", async () => {
      const mockChain = {
        select: vi.fn().mockResolvedValue({ count: null, error: new Error("Fail count") }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      await expect(ProfileService.fetchUserCount()).rejects.toThrow("Fail count");
    });
  });

  describe("fetchMyProfile", () => {
    it("should fetch profile by userId successfully", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "123", username: "miguel" }, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const profile = await ProfileService.fetchMyProfile("123");
      expect(profile).toEqual({ id: "123", username: "miguel" });
    });

    it("should log error and return null if fetchMyProfile query fails", async () => {
      const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Error" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const profile = await ProfileService.fetchMyProfile("123");
      expect(profile).toBeNull();
      expect(consoleMock).toHaveBeenCalled();
      consoleMock.mockRestore();
    });
  });

  describe("setUserProvince", () => {
    it("should return success = true on update success", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await ProfileService.setUserProvince("123", 45);
      expect(result.success).toBe(true);
    });

    it("should return success = false and error message on update failure", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: "Constraint failed" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await ProfileService.setUserProvince("123", 45);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Constraint failed");
    });
  });

  describe("setUserMarkerPosition", () => {
    it("should return success = true on update success", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await ProfileService.setUserMarkerPosition({
        userId: "123",
        lat: 40.4,
        lng: -3.6,
      });
      expect(result.success).toBe(true);
    });

    it("should return success = false and error message on update failure", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: "Update position failed" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await ProfileService.setUserMarkerPosition({
        userId: "123",
        lat: 40.4,
        lng: -3.6,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Update position failed");
    });
  });

  describe("deleteMyAccount", () => {
    it("should return success = true if account is deleted successfully", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
      
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(deleteChain as any);
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await ProfileService.deleteMyAccount();
      expect(result.success).toBe(true);
    });

    it("should return error if getUser fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "No user found" },
      });
      const result = await ProfileService.deleteMyAccount();
      expect(result.success).toBe(false);
      expect(result.error).toBe("No user found");
    });

    it("should return error if user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      const result = await ProfileService.deleteMyAccount();
      expect(result.success).toBe(false);
      expect(result.error).toBe("No hay sesión activa");
    });

    it("should return error if delete row fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: "Failed delete" } }),
      };
      mockSupabase.from.mockReturnValue(deleteChain as any);

      const result = await ProfileService.deleteMyAccount();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed delete");
    });

    it("should return error if signOut fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(deleteChain as any);
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: "Signout block" } });

      const result = await ProfileService.deleteMyAccount();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Signout block");
    });
  });
});

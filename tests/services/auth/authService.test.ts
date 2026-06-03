import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleSignIn,
  handleSignOut,
  getSession,
  subscribeToAuthChanges,
} from "@/services/auth/authService";
import { mockSupabase } from "../../setup";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleSignIn", () => {
    it("should sign in using OAuth with Twitter/X", async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
      await handleSignIn();
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "x",
        options: { redirectTo: window.location.origin },
      });
    });

    it("should throw error if signInWithOAuth returns error", async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: {},
        error: { message: "Auth failure" },
      });
      await expect(handleSignIn()).rejects.toThrow("Error signing in: Auth failure");
    });
  });

  describe("handleSignOut", () => {
    it("should sign out successfully", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      await handleSignOut();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it("should throw error if signOut returns error", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: "Network error" } });
      await expect(handleSignOut()).rejects.toThrow("Error signing out: Network error");
    });
  });

  describe("getSession", () => {
    it("should return session successfully", async () => {
      const mockSession = { user: { id: "123" } };
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      const session = await getSession();
      expect(session).toEqual(mockSession);
    });

    it("should return null and log console.error if getSession fails", async () => {
      const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Database down" },
      });
      const session = await getSession();
      expect(session).toBeNull();
      expect(consoleMock).toHaveBeenCalled();
      consoleMock.mockRestore();
    });
  });

  describe("subscribeToAuthChanges", () => {
    it("should subscribe and return unsubscribe callback", () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAuthChanges(callback);
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
      expect(unsubscribe).toBeTypeOf("function");
    });
  });
});

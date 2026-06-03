import { describe, it, expect } from "vitest";
import { formatNumberToAbbreviated, formatTime, formatUser } from "@/utils/formatters";
import type { User } from "@supabase/supabase-js";

describe("formatNumberToAbbreviated", () => {
  it("should format numbers less than 10 as string", () => {
    expect(formatNumberToAbbreviated(5)).toBe("5");
    expect(formatNumberToAbbreviated(0)).toBe("0");
  });

  it("should format numbers less than 100 in blocks of 10", () => {
    expect(formatNumberToAbbreviated(25)).toBe("20+");
    expect(formatNumberToAbbreviated(99)).toBe("90+");
  });

  it("should format numbers less than 1000 in blocks of 100", () => {
    expect(formatNumberToAbbreviated(450)).toBe("400+");
    expect(formatNumberToAbbreviated(999)).toBe("900+");
  });

  it("should format numbers between 1k and 10k with decimals if needed", () => {
    expect(formatNumberToAbbreviated(1200)).toBe("1.2k+");
    expect(formatNumberToAbbreviated(5000)).toBe("5k+");
  });

  it("should format numbers larger than 10k in thousands", () => {
    expect(formatNumberToAbbreviated(15300)).toBe("15k+");
  });
});

describe("formatTime", () => {
  it("should return empty string for null", () => {
    expect(formatTime(null)).toBe("");
  });

  it("should format ISO string to local time format", () => {
    const iso = "2026-06-03T12:30:00.000Z";
    const result = formatTime(iso);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("formatUser", () => {
  it("should return null if user is null or undefined", () => {
    expect(formatUser(null)).toBeNull();
    expect(formatUser(undefined)).toBeNull();
  });

  it("should format user details correctly with user metadata", () => {
    const mockUser = {
      id: "u123",
      email: "test@example.com",
      user_metadata: {
        name: "Carlos Lopez",
        avatar_url: "https://example.com/avatar.jpg"
      }
    } as unknown as User;

    const formatted = formatUser(mockUser);
    expect(formatted).toEqual({
      id: "u123",
      email: "test@example.com",
      name: "Carlos Lopez",
      avatarUrl: "https://example.com/avatar.jpg",
      initial: "C"
    });
  });

  it("should fallback name if user metadata is empty", () => {
    const mockUser = {
      id: "u123",
      email: "test@example.com",
      user_metadata: {}
    } as unknown as User;

    const formatted = formatUser(mockUser);
    expect(formatted?.name).toBe("Usuario");
  });
});

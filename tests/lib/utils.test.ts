import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge classes correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500"); // Tailwind classes merge
  });
});

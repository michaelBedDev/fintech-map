import type { User } from "@supabase/supabase-js";

/** Format a number into a human-friendly abbreviated string (e.g. 1.2k+) */
export function formatNumberToAbbreviated(n: number): string {
  if (n < 10) return `${n}`;
  if (n < 100) return `${Math.floor(n / 10) * 10}+`;
  if (n < 1_000) return `${Math.floor(n / 100) * 100}+`;
  if (n < 10_000) {
    const k = Math.floor(n / 100) / 10;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k+`;
  }
  return `${Math.floor(n / 1_000)}k+`;
}

export function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const formatUser = (user: User | null | undefined) => {
  if (!user) return null;

  const { user_metadata: meta } = user;

  // Prioridad de nombres según el provider (X, Google, etc)
  const name = meta?.name ?? meta?.full_name ?? meta?.user_name ?? "Usuario";

  return {
    id: user.id,
    email: user.email,
    name,
    avatarUrl: meta?.avatar_url ?? meta?.picture ?? "",
    initial: name.charAt(0).toUpperCase(),
  };
};

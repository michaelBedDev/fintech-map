//DB TYPES

import type { Tables } from "@/types/database.types";

/** Profile row inferred from Supabase schema */
export type Profile = Tables<"profiles">;

/** Provincia row inferred from Supabase schema */
export type Provincia = Tables<"provincias">;

/** Comunidad autónoma row inferred from Supabase schema */
export type ComunidadAutonoma = Tables<"comunidades_autonomas">;

/** País row inferred from Supabase schema */
export type Pais = Tables<"paises">;

/** Mensaje de chat row inferred from Supabase schema */
export type MensajeChat = Tables<"mensajes_chat">;

/** Chat message joined with author profile */
export type ChatMessage = MensajeChat & {
  profiles: Pick<Profile, "full_name" | "avatar_url" | "username"> | null;
};

/** Chat message for global chat (provincia_id is null) */
export type GlobalChatMessage = Omit<ChatMessage, "provincia_id"> & {
  provincia_id: null;
};

/** Profile joined with provincia name */
export type ProfileWithProvince = Profile & {
  provincias: Pick<Provincia, "nombre"> | null;
};

// Helpers
export type UserMarker = {
  userId: string;
  lat: number;
  lng: number;
};

export type SendMessagePayload = {
  autorId: string;
  provinciaId: number | null;
  contenido: string;
};

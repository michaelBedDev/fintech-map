import type { ChatMessage, SendMessagePayload } from "@/types/DTOs/dtos";
import { supabase } from "./auth/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface IChatService {
  /**
   * fetchChatMessages: retrieves chat messages for a specific province, including author profile info.
   * fetchGlobalChatMessages: retrieves messages for the global chat (where provincia_id is null).
   * sendChatMessage: sends a new message to a province chat or global chat.
   * subscribeToChatMessages: sets up a real-time subscription for new messages in a specific province.
   * subscribeToGlobalChat: sets up a real-time subscription for new messages in the global chat.
   *
   */
  fetchChatMessages(provinciaId: number, limit?: number): Promise<ChatMessage[]>;
  sendChatMessage(
    payload: SendMessagePayload,
  ): Promise<{ success: boolean; error?: string }>;
  fetchGlobalChatMessages(limit?: number): Promise<ChatMessage[]>;
  subscribeToChatMessages(
    provinciaId: number,
    onNewMessage: (message: ChatMessage) => void,
  ): RealtimeChannel;

  subscribeToGlobalChat(
    onNewMessage: (message: ChatMessage) => void,
  ): RealtimeChannel;
}

export const ChatService: IChatService = {
  async fetchChatMessages(provinciaId, limit = 50) {
    const { data, error } = await supabase
      .from("mensajes_chat")
      .select("*, profiles(full_name, avatar_url, username)")
      .eq("provincia_id", provinciaId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error cargando mensajes:", error.message);
      return [];
    }

    return _normalizeChatMessages(data);
  },

  async fetchGlobalChatMessages(limit = 50) {
    const { data, error } = await supabase
      .from("mensajes_chat")
      .select("*, profiles(full_name, avatar_url, username)")
      .is("provincia_id", null)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error cargando mensajes globales:", error.message);
      return [];
    }

    return _normalizeChatMessages(data);
  },

  async sendChatMessage(payload) {
    const { error } = await supabase.from("mensajes_chat").insert({
      autor_id: payload.autorId,
      provincia_id: payload.provinciaId,
      contenido: payload.contenido,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  subscribeToChatMessages(provinciaId, onNewMessage) {
    return supabase
      .channel(`chat-provincia-${provinciaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_chat",
          filter: `provincia_id=eq.${provinciaId}`,
        },
        async (payload) => {
          const profile = await _getOrFetchProfile(payload.new.autor_id);
          const message: ChatMessage = {
            id: payload.new.id,
            contenido: payload.new.contenido,
            autor_id: payload.new.autor_id,
            provincia_id: payload.new.provincia_id,
            created_at: payload.new.created_at,
            profiles: profile,
          };
          onNewMessage(message);
        },
      )
      .subscribe();
  },

  subscribeToGlobalChat(onNewMessage) {
    return supabase
      .channel("chat-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_chat",
          filter: "provincia_id=is.null",
        },
        async (payload) => {
          const profile = await _getOrFetchProfile(payload.new.autor_id);
          const message: ChatMessage = {
            id: payload.new.id,
            contenido: payload.new.contenido,
            autor_id: payload.new.autor_id,
            provincia_id: payload.new.provincia_id,
            created_at: payload.new.created_at,
            profiles: profile,
          };
          onNewMessage(message);
        },
      )
      .subscribe();
  },
};

// --- HELPERS (IMPLEMENTATION DETAILS) ---

interface CachedProfile {
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

const profileCache = new Map<string, CachedProfile>();

async function _getOrFetchProfile(userId: string): Promise<CachedProfile | null> {
  const cached = profileCache.get(userId);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, username")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Error cargando perfil del autor:", error?.message);
    return null;
  }

  const profile: CachedProfile = {
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    username: data.username,
  };
  profileCache.set(userId, profile);
  return profile;
}

/** Normalizes an array of chat messages */
function _normalizeChatMessages(data: any[]): ChatMessage[] {
  const normalized = (data ?? []).map(_normalizeSingleMessage);
  
  // Guardar en cache todos los perfiles de los mensajes cargados inicialmente
  for (const msg of normalized) {
    if (msg.autor_id && msg.profiles) {
      profileCache.set(msg.autor_id, msg.profiles);
    }
  }
  
  return normalized;
}

function _normalizeSingleMessage(m: any): ChatMessage {
  return {
    ...m,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  };
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatService } from "@/services/chatService";
import { mockSupabase } from "../setup";

describe("ChatService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchChatMessages", () => {
    it("should fetch and normalize province chat messages successfully", async () => {
      const mockMessages = [
        { id: "1", contenido: "Hola", autor_id: "u1", profiles: { full_name: "Miguel" } },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const msgs = await ChatService.fetchChatMessages(45);
      expect(mockSupabase.from).toHaveBeenCalledWith("mensajes_chat");
      expect(mockChain.eq).toHaveBeenCalledWith("provincia_id", 45);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].contenido).toBe("Hola");
      expect(msgs[0].profiles?.full_name).toBe("Miguel");
    });

    it("should return empty array and log error if query fails", async () => {
      const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: "SQL error" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const msgs = await ChatService.fetchChatMessages(45);
      expect(msgs).toEqual([]);
      expect(consoleMock).toHaveBeenCalled();
      consoleMock.mockRestore();
    });

    it("should normalize messages when profiles is an array", async () => {
      const mockMessages = [
        { id: "1", contenido: "Hola", autor_id: "u1", profiles: [{ full_name: "Miguel" }] },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const msgs = await ChatService.fetchChatMessages(45);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].profiles?.full_name).toBe("Miguel");
    });

    it("should handle null data and return empty array without crashing", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const msgs = await ChatService.fetchChatMessages(45);
      expect(msgs).toEqual([]);
    });
  });

  describe("fetchGlobalChatMessages", () => {
    it("should fetch and normalize global chat messages", async () => {
      const mockMessages = [
        { id: "2", contenido: "Mundo", autor_id: "u2", profiles: { full_name: "Elena" } },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const msgs = await ChatService.fetchGlobalChatMessages();
      expect(mockChain.is).toHaveBeenCalledWith("provincia_id", null);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].contenido).toBe("Mundo");
    });

    it("should return empty array and log error on failure", async () => {
      const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: "Failure" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const msgs = await ChatService.fetchGlobalChatMessages();
      expect(msgs).toEqual([]);
      expect(consoleMock).toHaveBeenCalled();
      consoleMock.mockRestore();
    });
  });

  describe("sendChatMessage", () => {
    it("should insert a new chat message and return success = true", async () => {
      const mockChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await ChatService.sendChatMessage({
        autorId: "u1",
        provinciaId: 12,
        contenido: "Test message",
      });
      expect(mockChain.insert).toHaveBeenCalledWith({
        autor_id: "u1",
        provincia_id: 12,
        contenido: "Test message",
      });
      expect(result.success).toBe(true);
    });

    it("should return success = false and error message on insert failure", async () => {
      const mockChain = {
        insert: vi.fn().mockResolvedValue({ error: { message: "Block spam" } }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await ChatService.sendChatMessage({
        autorId: "u1",
        provinciaId: 12,
        contenido: "Test message",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Block spam");
    });
  });

  describe("realtime subscriptions and caching", () => {
    it("should subscribe to province chat changes and handle postgres INSERT event", async () => {
      let capturedCallback: Function = () => {};
      const mockChannel = {
        on: vi.fn().mockImplementation((event, filter, callback) => {
          capturedCallback = callback;
          return mockChannel;
        }),
        subscribe: vi.fn().mockReturnThis(),
      };
      mockSupabase.channel.mockReturnValue(mockChannel as any);

      // Suministramos un perfil simulado a retornar en la petición HTTP del helper
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { full_name: "Miguel", avatar_url: "url", username: "miguel" },
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);

      const onNewMsg = vi.fn();
      ChatService.subscribeToChatMessages(25, onNewMsg);

      expect(mockSupabase.channel).toHaveBeenCalledWith("chat-provincia-25");
      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_chat",
          filter: "provincia_id=eq.25",
        },
        expect.any(Function)
      );

      // Disparar manualmente el callback simulando el evento de realtime
      await capturedCallback({
        new: {
          id: "m1",
          contenido: "Hola desde 25",
          autor_id: "user123",
          provincia_id: 25,
          created_at: "2026-06-03T11:00:00Z",
        },
      });

      // El callback debe llamar a onNewMsg con el mensaje construido
      expect(onNewMsg).toHaveBeenCalledWith({
        id: "m1",
        contenido: "Hola desde 25",
        autor_id: "user123",
        provincia_id: 25,
        created_at: "2026-06-03T11:00:00Z",
        profiles: {
          full_name: "Miguel",
          avatar_url: "url",
          username: "miguel",
        },
      });

      // Verificar el caché de perfiles: una segunda llamada con el mismo autor_id no debe realizar llamadas SQL a la BD
      mockSupabase.from.mockClear();
      await capturedCallback({
        new: {
          id: "m2",
          contenido: "Segundo mensaje",
          autor_id: "user123",
          provincia_id: 25,
          created_at: "2026-06-03T11:01:00Z",
        },
      });

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(onNewMsg).toHaveBeenLastCalledWith({
        id: "m2",
        contenido: "Segundo mensaje",
        autor_id: "user123",
        provincia_id: 25,
        created_at: "2026-06-03T11:01:00Z",
        profiles: {
          full_name: "Miguel",
          avatar_url: "url",
          username: "miguel",
        },
      });
    });

    it("should handle error gracefully and log error if profile download fails", async () => {
      let capturedCallback: Function = () => {};
      const mockChannel = {
        on: vi.fn().mockImplementation((event, filter, callback) => {
          capturedCallback = callback;
          return mockChannel;
        }),
        subscribe: vi.fn().mockReturnThis(),
      };
      mockSupabase.channel.mockReturnValue(mockChannel as any);

      // Error en base de datos al buscar perfil
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Network timeout" },
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain as any);
      const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});

      const onNewMsg = vi.fn();
      ChatService.subscribeToGlobalChat(onNewMsg);

      await capturedCallback({
        new: {
          id: "mg1",
          contenido: "Hola global",
          autor_id: "nonexistent",
          provincia_id: null,
          created_at: "2026-06-03T11:02:00Z",
        },
      });

      expect(consoleMock).toHaveBeenCalled();
      expect(onNewMsg).toHaveBeenCalledWith({
        id: "mg1",
        contenido: "Hola global",
        autor_id: "nonexistent",
        provincia_id: null,
        created_at: "2026-06-03T11:02:00Z",
        profiles: null,
      });

      consoleMock.mockRestore();
    });
  });
});

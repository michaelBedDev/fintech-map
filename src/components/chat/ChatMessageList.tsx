import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/contexts/ChatContext";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import { formatTime } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { getFallbackAvatar } from "@/utils/map-utils";
import type { ChatMessage } from "@/types/DTOs/dtos";

export function ChatMessageList() {
  const { messages, session } = useChat();
  const currentUserId = session?.user?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useChatScroll(messagesEndRef, [messages]);

  return (
    <div className='flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-3 sm:max-h-96 sm:min-h-96'>
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            isOwn={msg.autor_id === currentUserId}
          />
        ))
      )}
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

/**
 * Sub-components
 */

function EmptyState() {
  return (
    <p className='text-xs text-muted-foreground text-center py-8'>
      No hay mensajes aún. ¡Sé el primero!
    </p>
  );
}

function MessageItem({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const authorName = msg.profiles?.full_name || "?";
  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      <Avatar className='h-6 w-6 shrink-0 mt-0.5'>
        <AvatarImage src={msg.profiles?.avatar_url ?? undefined} />
        <AvatarFallback className='text-[10px] p-0' delayMs={msg.profiles?.avatar_url ? 600 : 0}>
          <img src={getFallbackAvatar(authorName)} className='h-full w-full object-cover rounded-full' alt='default' />
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[75%] flex flex-col gap-0.5",
          isOwn ? "items-end" : "items-start",
        )}>
        {!isOwn && (
          <span className='text-[10px] text-muted-foreground px-1'>
            {msg.profiles?.full_name ?? "Anónimo"}
          </span>
        )}

        <div
          className={cn(
            "rounded-2xl px-3 py-1.5 text-sm wrap-break-word",
            isOwn
              ? "bg-[#1d9bf0] text-white rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm",
          )}>
          {msg.contenido}
        </div>

        <span className='text-[9px] text-muted-foreground/60 px-1'>
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );
}

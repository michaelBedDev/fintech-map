import { useRef, type KeyboardEvent } from "react";
import { SendIcon } from "@/components/shared/Icons";
import { useChat } from "@/contexts/ChatContext";

export function ChatInput() {
  const { session, input, setInput, handleSend, sending, activeTab, provinciaName } =
    useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div className='px-3 py-3 border-t border-border text-center'>
        <p className='text-xs text-muted-foreground'>Inicia sesión para chatear</p>
      </div>
    );
  }

  const placeholderText =
    activeTab === "global" ? "Mensaje global..." : `Mensaje en ${provinciaName}...`;

  const isButtonDisabled = !input.trim() || sending;

  return (
    <div className='flex items-center gap-2 px-3 py-2 border-t border-border'>
      <input
        ref={inputRef}
        type='text'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholderText}
        maxLength={500}
        disabled={sending}
        className='flex-1 bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-[#1d9bf0] border-none disabled:opacity-50'
      />

      <button
        onClick={handleSend}
        disabled={isButtonDisabled}
        className='shrink-0 w-8 h-8 rounded-full bg-[#1d9bf0] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#1a8cd8] transition-colors cursor-pointer disabled:cursor-not-allowed'
        type='button'>
        <SendIcon />
      </button>
    </div>
  );
}

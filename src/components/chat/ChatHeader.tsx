import { ChatIcon, CloseIcon } from "@/components/shared/Icons";
import { useChat } from "@/contexts/ChatContext";

export function ChatHeader() {
  const { setOpen } = useChat();

  return (
    <div className='flex items-center justify-between px-4 py-2.5 border-b border-border'>
      <div className='flex items-center gap-2'>
        <ChatIcon className='h-4 w-4 text-muted-foreground' />

        <span className='text-sm font-semibold text-foreground truncate'>Chat</span>
      </div>

      <button
        onClick={() => setOpen(false)}
        className='text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer'
        type='button'>
        <CloseIcon className='h-4 w-4 text-muted-foreground' />
      </button>
    </div>
  );
}

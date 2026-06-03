import { Badge } from "@/components/ui/badge";
import { ChatIcon } from "@/components/shared/Icons";

interface ChatToggleButtonProps {
  onOpen: () => void;
  count: number;
}

export function ChatToggleButton({ onOpen, count }: ChatToggleButtonProps) {
  return (
    <button
      onClick={onOpen}
      className='absolute bottom-3 left-3 map-overlay z-1000 flex items-center gap-2 rounded-full bg-card/90 backdrop-blur px-4 py-2 shadow-lg border border-border hover:bg-accent transition-colors cursor-pointer'
      type='button'>
      <ChatIcon size={16} className='text-foreground' />
      <span className='text-sm font-medium text-foreground'>Chat</span>

      {/* Notifications Counter */}
      {count > 0 && (
        <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
          {count}
        </Badge>
      )}
    </button>
  );
}

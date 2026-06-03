import { Card } from "@/components/ui/card";
import type { Session } from "@supabase/supabase-js";
import { ChatHeader } from "./ChatHeader";
import { ChatToggleButton } from "./ChatToggleButton";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ChatTabs } from "./ChatTabs";
import { ChatProvider, useChat } from "@/contexts/ChatContext";

interface ChatPanelProps {
  provinciaId: number;
  provinciaName: string;
  session: Session | null;
}

export function ChatPanel(props: ChatPanelProps) {
  return (
    <ChatProvider {...props}>
      <ChatContent />
    </ChatProvider>
  );
}

function ChatContent() {
  const { open, counts, setOpen } = useChat();

  if (!open) {
    return <ChatToggleButton onOpen={() => setOpen(true)} count={counts.total} />;
  }

  return (
    <Card className='absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 max-sm:max-h-[60vh] map-overlay z-1000 flex flex-col shadow-2xl border-border bg-card/95 backdrop-blur overflow-hidden rounded-xl py-0 gap-0'>
      <ChatHeader />
      <ChatTabs />
      <ChatMessageList />
      <ChatInput />
    </Card>
  );
}

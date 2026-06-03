// context/ChatContext.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useChatMessages } from "@/hooks/chat/queries";
import { useSendMessage } from "@/hooks/chat/mutations";
import type { ChatMessage } from "@/types/DTOs/dtos";
import type { Session } from "@supabase/supabase-js";

interface ChatContextType {
  // Estado UI
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: "provincia" | "global";
  setActiveTab: (tab: "provincia" | "global") => void;
  input: string;
  setInput: (val: string) => void;

  // Datos y TanStack
  messages: ChatMessage[];
  counts: { province: number; global: number; total: number };
  sending: boolean;
  session: Session | null;

  // Acciones
  handleSend: () => void;
  provinciaName: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  provinciaId,
  provinciaName,
  session,
}: {
  children: ReactNode;
  provinciaId: number;
  provinciaName: string;
  session: Session | null;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"provincia" | "global">("provincia");
  const [input, setInput] = useState("");

  const { data: provinceMessages = [] } = useChatMessages(provinciaId);
  const { data: globalMessages = [] } = useChatMessages();
  const { mutateAsync: sendMessage, isPending: sending } = useSendMessage();

  const messages = activeTab === "provincia" ? provinceMessages : globalMessages;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !session?.user?.id || sending) return;

    try {
      await sendMessage({
        autorId: session.user.id,
        provinciaId: activeTab === "global" ? null : provinciaId,
        contenido: text,
      });
      setInput("");
    } catch {
      // The mutation hook already shows the error toast.
    }
  }, [input, session, provinciaId, sending, activeTab, sendMessage]);

  const value: ChatContextType = {
    open,
    setOpen,
    activeTab,
    setActiveTab,
    input,
    setInput,
    messages,
    sending,
    session,
    handleSend,
    provinciaName,
    counts: {
      province: provinceMessages.length,
      global: globalMessages.length,
      total: provinceMessages.length + globalMessages.length,
    },
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat debe usarse dentro de ChatProvider");
  return context;
};

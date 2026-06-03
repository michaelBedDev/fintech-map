import { Badge } from "@/components/ui/badge";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

export function ChatTabs() {
  const { activeTab, setActiveTab, provinciaName, counts } = useChat();

  const tabs = [
    { id: "provincia" as const, label: provinciaName, count: counts.province },
    { id: "global" as const, label: "Global", count: counts.global },
  ];

  return (
    <div className='flex border-b border-border'>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type='button'
            className={cn(
              "flex-1 text-xs font-medium py-2 transition-colors relative",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}>
            {tab.label}

            {tab.count > 0 && (
              <Badge
                variant='secondary'
                className='ml-1.5 text-[9px] px-1 py-0 align-middle'>
                {tab.count}
              </Badge>
            )}

            {isActive && (
              <div className='absolute bottom-0 left-2 right-2 h-0.5 bg-[#1d9bf0] rounded-full' />
            )}
          </button>
        );
      })}
    </div>
  );
}

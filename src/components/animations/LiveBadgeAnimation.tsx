import { LiveDot } from "./atomic/LiveDot";
import { PresenceExpand } from "./atomic/PresenceExpand";
import { SlidingText } from "./atomic/SlidingText";

interface LiveBadgeAnimationProps {
  value: string | null;
  label: string;
  isVisible: boolean;
}

export function LiveBadgeAnimation({
  value,
  label,
  isVisible,
}: LiveBadgeAnimationProps) {
  return (
    <PresenceExpand isVisible={isVisible && !!value}>
      <div className='flex items-center gap-1.5 rounded-md bg-secondary/60 backdrop-blur-sm px-2.5 py-1 cursor-default select-none'>
        <LiveDot />

        <SlidingText
          value={value!}
          className='text-[13px] font-semibold tabular-nums text-foreground leading-5'
        />

        <span className='text-[11px] text-muted-foreground font-medium hidden sm:inline'>
          {label}
        </span>
      </div>
    </PresenceExpand>
  );
}

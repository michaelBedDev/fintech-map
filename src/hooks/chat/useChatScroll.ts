import { useEffect, type RefObject } from "react";

/**
 * Automatically scrolls to the bottom of the chat when messages change.
 */
export function useChatScroll(
  ref: RefObject<HTMLDivElement | null>,
  dependency: any[],
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dependency, ref]);
}

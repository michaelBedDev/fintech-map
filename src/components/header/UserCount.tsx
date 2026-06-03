import { useUserCount } from "@/hooks/profiles/queries";
import { LiveBadgeAnimation } from "../animations/LiveBadgeAnimation";
import { formatNumberToAbbreviated } from "@/utils/formatters";

export function UserCount() {
  const { data: count, isLoading } = useUserCount();

  const formatted = count !== undefined ? formatNumberToAbbreviated(count) : null;

  return (
    <LiveBadgeAnimation value={formatted} label='users' isVisible={!isLoading} />
  );
}

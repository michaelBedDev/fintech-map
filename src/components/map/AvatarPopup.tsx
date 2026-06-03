import { getFallbackAvatar } from "@/utils/map-utils";
import { XIcon } from "@/components/shared/Icons";
import type { ProfileWithProvince } from "@/types/DTOs/dtos";

interface AvatarPopupProps {
  profile: ProfileWithProvince;
}

export function AvatarPopup({ profile }: AvatarPopupProps) {
  const fullName = profile.full_name ?? "Sin nombre";
  const username = profile.username?.trim();
  const fallbackUrl = getFallbackAvatar(fullName);

  return (
    <div className='flex min-w-30 flex-col items-center gap-2 p-2'>
      <img
        src={profile.avatar_url || fallbackUrl}
        alt={fullName}
        className='h-12 w-12 rounded-full border-2 border-primary object-cover bg-muted'
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackUrl;
        }}
      />

      <span className='text-center text-sm font-semibold'>{fullName}</span>

      {username && (
        <a
          href={`https://x.com/intent/follow?screen_name=${encodeURIComponent(username)}`}
          target='_blank'
          rel='noopener noreferrer'
          className='follow-btn'>
          <XIcon size={14} />
          Seguir
        </a>
      )}
    </div>
  );
}

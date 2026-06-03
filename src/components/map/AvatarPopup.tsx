import { XIcon } from "@/components/shared/Icons";
import type { ProfileWithProvince } from "@/types/DTOs/dtos";

interface AvatarPopupProps {
  profile: ProfileWithProvince;
}

export function AvatarPopup({ profile }: AvatarPopupProps) {
  const fullName = profile.full_name ?? "Sin nombre";
  const username = profile.username?.trim();

  return (
    <div className='flex min-w-30 flex-col items-center gap-2 p-2'>
      {profile.avatar_url && (
        <img
          src={profile.avatar_url}
          alt={fullName}
          className='h-12 w-12 rounded-full border-2 border-primary object-cover'
        />
      )}

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

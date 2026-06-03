import type { DragEndEvent } from "leaflet";
import { Marker, Popup } from "react-leaflet";

import { createAvatarIcon } from "@/utils/map-utils";
import { AvatarPopup } from "@/components/map/AvatarPopup";
import type { ProfileWithProvince } from "@/types/DTOs/dtos";

interface AvatarMarkerProps {
  profile: ProfileWithProvince;
  position: [number, number];
  isCurrentUser: boolean;
  onDragEnd?: (e: DragEndEvent, previousPosition: [number, number]) => void;
}

export function AvatarMarker({
  profile,
  position,
  isCurrentUser,
  onDragEnd,
}: AvatarMarkerProps) {
  return (
    <Marker
      position={position}
      icon={createAvatarIcon(profile.avatar_url, profile.full_name ?? "")}
      draggable={isCurrentUser}
      eventHandlers={
        isCurrentUser && onDragEnd
          ? {
              dragend: (e) => onDragEnd(e, position),
            }
          : undefined
      }>
      <Popup className='avatar-popup'>
        <AvatarPopup profile={profile} />
      </Popup>
    </Marker>
  );
}

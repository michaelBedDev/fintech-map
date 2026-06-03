import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProfileWithProvince } from "@/types/DTOs/dtos";
import { getFallbackAvatar } from "@/utils/map-utils";

interface MapOverlayProps {
  provinceName: string | null;
  profiles: ProfileWithProvince[];
}

export function MapOverlay({ provinceName, profiles }: MapOverlayProps) {
  if (!provinceName) return null;

  return (
    <div className='map-overlay absolute top-4 right-4 z-1000 flex flex-col items-end gap-3 pointer-events-none'>
      <Badge
        variant='secondary'
        className='px-3 py-1 text-sm font-medium shadow-md pointer-events-auto border-border/50 bg-background/80 backdrop-blur-md'>
        {provinceName}
        {profiles.length > 0 && (
          <span className='ml-2 text-muted-foreground tabular-nums'>
            ({profiles.length})
          </span>
        )}
      </Badge>

      {profiles.length > 0 && (
        <Card className='w-60 shadow-xl pointer-events-auto border-border/50 bg-background/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2'>
          <CardContent className='p-3 space-y-2.5'>
            <div className='flex flex-col gap-2'>
              {profiles.slice(0, 8).map((profile) => (
                <div key={profile.id} className='flex items-center gap-2 group'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className='h-7 w-7 border border-border group-hover:border-primary/50 transition-colors'>
                        <AvatarImage src={profile.avatar_url ?? undefined} />
                        <AvatarFallback className='text-[10px] bg-muted p-0'>
                          <img src={getFallbackAvatar(profile.full_name || "")} className='h-full w-full object-cover rounded-full' alt='default' />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side='left'>{profile.full_name}</TooltipContent>
                  </Tooltip>
                  <span className='text-xs font-medium truncate text-foreground/90'>
                    {profile.full_name}
                  </span>
                </div>
              ))}
            </div>

            {profiles.length > 8 && (
              <p className='text-[10px] text-center text-muted-foreground font-medium pt-1 border-t border-border/50'>
                + {profiles.length - 8} usuarios más
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

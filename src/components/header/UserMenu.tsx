import { Link } from "@tanstack/react-router";
import { LogOut, Trash2, Info } from "lucide-react";
import { useAuthSession } from "@/hooks/auth/queries";
import { useLogout } from "@/hooks/auth/mutations";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFallbackAvatar, getSafeAvatarUrl } from "@/utils/map-utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";
import { formatUser } from "@/utils/formatters";
interface UserMenuProps {
  onOpenDelete: () => void;
}

export function UserMenu({ onOpenDelete }: UserMenuProps) {
  const { data: session, isLoading } = useAuthSession();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const user = useMemo(() => formatUser(session?.user), [session?.user]);

  if (isLoading)
    return <div className='h-9 w-9 animate-pulse rounded-full bg-muted' />;

  if (!user) return null;

  return (
    <div className='flex items-center gap-2'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to='/about'>
            <Button variant='ghost' size='icon' className='h-9 w-9'>
              <Info className='h-4 w-4' />
              <span className='sr-only'>Sobre FinXMap</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>Sobre FinXMap</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='relative h-9 flex items-center gap-2 rounded-full px-2'>
            <Avatar className='h-7 w-7'>
              <AvatarImage src={getSafeAvatarUrl(user.avatarUrl, user.name)} />
              <AvatarFallback className='text-[10px] p-0' delayMs={600}>
                <img src={getFallbackAvatar(user.name)} className='h-full w-full object-cover rounded-full' alt='default' />
              </AvatarFallback>
            </Avatar>
            <span className='text-sm font-medium hidden sm:inline'>{user.name}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-52'>
          <DropdownMenuItem
            onClick={onOpenDelete}
            className='text-destructive cursor-pointer'>
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Eliminar mi cuenta</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => logout()}
            disabled={isLoggingOut}
            className='cursor-pointer'>
            <LogOut className='mr-2 h-4 w-4' />
            <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

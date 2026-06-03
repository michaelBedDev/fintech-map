import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Info, type LucideIcon } from "lucide-react";
import { XIcon } from "@/components/shared/Icons";
import { useLogin } from "@/hooks/auth/mutations";

// Links
const GUEST_LINKS = [
  { to: "/about", label: "Sobre finXMap", Icon: Info },
  { to: "/privacy", label: "Política de Privacidad", Icon: Shield },
] as const;

export function GuestActions() {
  const { mutate: login, isPending: isLoggingIn } = useLogin();

  return (
    <div className='flex items-center gap-3'>
      {GUEST_LINKS.map((link) => (
        <NavIconButton key={link.to} {...link} />
      ))}

      <Button
        onClick={() => login()}
        disabled={isLoggingIn}
        className='gap-2 transition-all active:scale-95'>
        <XIcon size={16} />
        <span>{isLoggingIn ? "Conectando..." : "Iniciar sesion con X"}</span>
      </Button>
    </div>
  );
}

/**
 * Sub-component: NavIconButton
 */
interface NavIconButtonProps {
  to: string;
  label: string;
  Icon: LucideIcon;
}

function NavIconButton({ to, label, Icon }: NavIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Link to={to}>
          <Button variant='ghost' size='icon' className='h-9 w-9'>
            <Icon className='h-4 w-4 text-muted-foreground' />
            <span className='sr-only'>{label}</span>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side='bottom'>
        <p className='text-xs font-medium'>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

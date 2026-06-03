import { Link } from "@tanstack/react-router";
import { UserCount } from "@/components/header/UserCount";

export function HeaderLogo() {
  return (
    <div className='flex items-center gap-4'>
      <Link to='/'>
        <h1 className='text-xl font-bold text-foreground tracking-tight'>FinXMap</h1>
      </Link>
      <UserCount />
    </div>
  );
}

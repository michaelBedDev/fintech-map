import { useAuthSession } from "@/hooks/auth/queries";
import { useDeleteAccount } from "@/hooks/profiles/mutations";
import { useState } from "react";
import { HeaderLogo } from "@/components/header/HeaderLogo";
import { UserMenu } from "@/components/header/UserMenu";
import { GuestActions } from "@/components/header/GuestActions";
import { DeleteAccountDialog } from "@/components/header/DeleteAccountDialog";

export function Header() {
  const { data: session, isLoading } = useAuthSession();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  // Conditional render for the right section of the header
  const renderRightSection = () => {
    if (isLoading) {
      return <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />;
    }

    if (session) {
      return <UserMenu onOpenDelete={() => setIsDeleteDialogOpen(true)} />;
    }

    return <GuestActions />;
  };

  return (
    <header className='relative z-1000 flex items-center justify-between px-6 py-3 border-b border-border bg-card'>
      <HeaderLogo />

      {/* Container user-data/login */}
      <div className='flex items-center gap-3'>{renderRightSection()}</div>

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={deleteAccount}
        isDeleting={isDeleting}
      />
    </header>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/auth/supabaseClient";
import { useAuthSession } from "@/hooks/auth/queries";
import { Header } from "@/components/Header";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// 1. IMPORTS CORREGIDOS
import { LocationService } from "@/services/locationService"; // Importamos el service para el fetch manual
import { useProfiles } from "@/hooks/profiles/queries";
import { useUpdateProvince, useUpdateMarker } from "@/hooks/profiles/mutations"; // Ambos hooks de mutación
import { SelectedMap } from "@/components/SelectedMap";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data: sessionData, isLoading: authLoading } = useAuthSession();
  const session = sessionData ?? null;
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingProvince, setPendingProvince] = useState<string | null>(null);

  // 2. HOOKS DE SERVIDOR (Siempre en la raíz)
  const { data: profiles = [] } = useProfiles();

  // Extraemos las funciones de mutación y su estado de carga
  const { mutate: updateProvince, isPending: savingProvince } = useUpdateProvince();
  const { mutate: updateMarker, isPending: savingMarker } = useUpdateMarker();

  // 3. DERIVACIÓN (Sustituye a los mil estados y useEffects)
  const myProfile = profiles.find((p) => p.id === session?.user?.id);
  const myProvince = myProfile?.provincias?.nombre ?? null;
  const myProvinciaId = myProfile?.provincia_id ?? null;

  // El estado 'saving' ahora es la suma de cualquiera de nuestras mutaciones
  const isSaving = savingProvince || savingMarker;

  // Guardar avatar de X en bucket de Supabase si es externo
  useEffect(() => {
    if (!session?.user?.id || !myProfile) return;

    const currentAvatar = myProfile.avatar_url;
    const isExternal = currentAvatar && !currentAvatar.includes("/storage/v1/object/public/avatars/");

    if (isExternal) {
      supabase.functions.invoke("cache-avatar", {
        body: { userId: session.user.id, imageUrl: session.user.user_metadata.avatar_url },
      }).then(({ data, error }) => {
        if (error) {
          console.error("Error cacheando avatar:", error);
        } else if (data?.success) {
          queryClient.invalidateQueries({ queryKey: ["profiles"] });
        }
      });
    }
  }, [session, myProfile, queryClient]);

  // Handlers
  const handleProvinceSelect = useCallback(
    (provinceName: string) => {
      if (!session) {
        toast.error("Inicia sesión para seleccionar tu provincia");
        return;
      }
      if (provinceName === myProvince) {
        toast.info("Ya estás en esta provincia");
        return;
      }
      setPendingProvince(provinceName);
      setConfirmOpen(true);
    },
    [session, myProvince],
  );

  const handleConfirmProvince = useCallback(async () => {
    if (!session?.user?.id || !pendingProvince) return;

    // Usamos el SERVICE para obtener el ID (no un hook)
    const provinciaId =
      await LocationService.fetchProvinciaIdByName(pendingProvince);

    if (!provinciaId) {
      toast.error(`No se encontró la provincia "${pendingProvince}"`);
      setConfirmOpen(false);
      return;
    }

    // Ejecutamos la mutación
    updateProvince(
      { userId: session.user.id, provinciaId },
      {
        onSuccess: () => {
          toast.success(`Te has ubicado en ${pendingProvince}`);
          setConfirmOpen(false);
          setPendingProvince(null);
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`);
        },
      },
    );
  }, [session, pendingProvince, updateProvince]);

  const handleMarkerDrag = useCallback(
    (lat: number, lng: number) => {
      if (!session?.user?.id) return;

      updateMarker({
        userId: session.user.id,
        lat,
        lng,
      });
    },
    [session, updateMarker],
  );

  if (authLoading) {
    return (
      <div className='h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground text-lg'>Cargando...</p>
      </div>
    );
  }

  return (
    <div className='h-screen bg-background flex flex-col overflow-hidden'>
      <Header />

      <main className='flex-1 relative'>
        {myProvince && (
          <div className='absolute bottom-3 right-3 map-overlay'>
            <Badge className='text-sm px-3 py-1.5 shadow-lg'>
              Tu provincia: {myProvince}
            </Badge>
          </div>
        )}

        <SelectedMap
          selectedProvince={myProvince}
          onProvinceSelect={handleProvinceSelect}
          profiles={profiles}
          dialogOpen={confirmOpen}
          currentUserId={session?.user?.id ?? null}
          onMarkerDrag={handleMarkerDrag}
        />

        {myProvinciaId && myProvince && (
          <ChatPanel
            provinciaId={myProvinciaId}
            provinciaName={myProvince}
            session={session}
          />
        )}
      </main>

      <footer className='flex items-center justify-center gap-3 py-1 sm:absolute sm:bottom-1 sm:left-1/2 sm:-translate-x-1/2 sm:py-0 map-overlay pointer-events-auto'>
        <p className='text-[10px] text-muted-foreground/50'>
          Hecho por MichaelBed con ❤️
        </p>
        <Link
          to='/privacy'
          className='text-[10px] text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-2'>
          Política de Privacidad
        </Link>
      </footer>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {myProvince ? "Cambiar de provincia" : "Seleccionar provincia"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {myProvince
                ? `¿Quieres cambiar de ${myProvince} a ${pendingProvince}?`
                : `¿Quieres ubicarte en ${pendingProvince}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmProvince} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

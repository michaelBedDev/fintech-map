import { useEffect, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { RealtimeChannel } from "@supabase/supabase-js";

interface SyncOptions<T> {
  queryKey: QueryKey;
  subscribeFn: (callback: (payload: T) => void) => RealtimeChannel;
}

export function useRealtimeSync<T extends { id: string | number }>({
  queryKey,
  subscribeFn,
}: SyncOptions<T>) {
  const queryClient = useQueryClient();
  const subscribeFnRef = useRef(subscribeFn);

  // Mantener la referencia de la función actualizada
  useEffect(() => {
    subscribeFnRef.current = subscribeFn;
  }, [subscribeFn]);

  useEffect(() => {
    const channel = subscribeFnRef.current((newData) => {
      queryClient.setQueryData<T[]>(queryKey, (old = []) => {
        if (old.some((item) => item.id === newData.id)) return old;
        return [...old, newData];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [queryKey, queryClient]);
}

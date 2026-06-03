import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export const handleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "x",
    options: { redirectTo: window.location.origin },
  });

  if (error) throw new Error("Error signing in: " + error.message);
};

export const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Error signing out: " + error.message);
};

export const getSession = async (): Promise<Session | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error.message);
    return null;
  }
  return session;
};

export const subscribeToAuthChanges = (
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

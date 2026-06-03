import type { Profile, ProfileWithProvince, UserMarker } from "@/types/DTOs/dtos";
import { supabase } from "./auth/supabaseClient";

export interface IProfileService {
  /** fetchUserCount: obtains the total number of user profiles in the database
   * fetchAllProfiles: retrieves all user profiles along with theri province name
   * fetchMyProfile: gets the current user's profile based on their user ID
   * fetchProvinciaIdByName: looks up a province ID by its name, returning null if not found
   * setUserProvince: assigns a province to the current user, resetting any custom marker position
   * setUserMarkerPosition: saves a custom marker position for the user, which will override the province location on the map
   * deleteMyAccount: deletes current user's profile row and sign out
   */
  fetchUserCount(): Promise<number>;
  fetchAllProfiles(): Promise<ProfileWithProvince[]>;
  fetchMyProfile(userId: string): Promise<Profile | null>;
  setUserProvince(
    userId: string,
    provinciaId: number,
  ): Promise<{ success: boolean; error?: string }>;
  setUserMarkerPosition(
    userMarker: UserMarker,
  ): Promise<{ success: boolean; error?: string }>;
  deleteMyAccount(): Promise<{ success: boolean; error?: string }>;
}

export const ProfileService: IProfileService = {
  async fetchAllProfiles(): Promise<ProfileWithProvince[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, username, provincia_id, updated_at, marker_lat, marker_lng, followers_count, provincias(nombre)",
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return _normalizeProfiles(data);
  },

  async fetchUserCount(): Promise<number> {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  },

  async fetchMyProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error cargando perfil:", error.message);
      return null;
    }
    return data;
  },

  async setUserProvince(
    userId: string,
    provinciaId: number,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from("profiles")
      .update({
        provincia_id: provinciaId,
        marker_lat: null,
        marker_lng: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async setUserMarkerPosition(
    userMarker: UserMarker,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from("profiles")
      .update({
        marker_lat: userMarker.lat,
        marker_lng: userMarker.lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userMarker.userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async deleteMyAccount(): Promise<{
    success: boolean;
    error?: string;
  }> {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) return { success: false, error: getUserError.message };
    if (!user) return { success: false, error: "No hay sesión activa" };

    const deleteError = await _deleteProfileRow(user.id);
    if (deleteError) return { success: false, error: deleteError };

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) return { success: false, error: signOutError.message };

    return { success: true };
  },
};

// --- HELPERS (IMPLEMENTATION DETAILS) ---
function _normalizeProfiles(data: any[]): ProfileWithProvince[] {
  return data.map((p) => ({
    ...p,
    provincias: Array.isArray(p.provincias) ? p.provincias[0] : p.provincias,
  }));
}

async function _deleteProfileRow(userId: string): Promise<string | null> {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  return error?.message ?? null;
}

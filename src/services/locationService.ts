import { supabase } from "./auth/supabaseClient";

export interface ILocationService {
  /** fetchProvinciaIdByName: Fetch province ID by name
   */
  fetchProvinciaIdByName(nombre: string): Promise<number | null>;
}

export const LocationService: ILocationService = {
  async fetchProvinciaIdByName(nombre: string): Promise<number | null> {
    const { data, error } = await supabase
      .from("provincias")
      .select("id")
      .eq("nombre", nombre)
      .single();

    if (error) {
      console.error("Error buscando provincia:", error.message);
      return null;
    }
    return data?.id ?? null;
  },
};

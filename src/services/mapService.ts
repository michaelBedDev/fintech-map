import {
  SPAIN_PROVINCES_GEOJSON_URL,
  ANDORRA_PROVINCES_GEOJSON_URL,
} from "@/const/maps_constants";
import type { FeatureCollection } from "geojson";

export const MapService = {
  async fetchCombinedProvinces(): Promise<FeatureCollection> {
    const [spain, andorra] = await Promise.all([
      fetch(SPAIN_PROVINCES_GEOJSON_URL).then((res) => {
        if (!res.ok) throw new Error("Error loading Spain GeoJSON");
        return res.json();
      }),
      fetch(ANDORRA_PROVINCES_GEOJSON_URL).then((res) => {
        if (!res.ok) throw new Error("Error loading Andorra GeoJSON");
        return res.json();
      }),
    ]);

    return {
      type: "FeatureCollection",
      features: [...spain.features, ...andorra.features],
    };
  },
};

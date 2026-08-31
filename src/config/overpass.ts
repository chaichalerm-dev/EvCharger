export const OVERPASS_RESULT_LIMITS = {
  evStations: 80,
  gasStations: 80,
  pois: 180,
} as const;

/** Photon is a real OpenStreetMap geocoder used only when the configured
 * Overpass instance is unavailable. Bounded, user-triggered requests keep use modest. */
export const PHOTON_OSM_TAG_GROUPS = ["amenity:charging_station", "amenity:fuel", "amenity", "shop", "tourism"] as const;
export const PHOTON_RESULT_LIMIT = 50;
export const DEFAULT_PHOTON_ENDPOINT = "https://photon.komoot.io/reverse";

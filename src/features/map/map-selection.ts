import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

export type MapSelectionOrigin = "MAP" | "SEARCH";

export type MapSelectionLocation = {
  latitude: number;
  longitude: number;
};

export function circlePolygon(longitude: number, latitude: number, radiusKm: number) {
  const coordinates: number[][] = [];
  const earth = 6371;
  for (let i = 0; i <= 64; i++) {
    const bearing = i * 360 / 64 * Math.PI / 180;
    const latitudeRad = latitude * Math.PI / 180;
    const longitudeRad = longitude * Math.PI / 180;
    const distance = radiusKm / earth;
    const latitude2 = Math.asin(Math.sin(latitudeRad) * Math.cos(distance) + Math.cos(latitudeRad) * Math.sin(distance) * Math.cos(bearing));
    const longitude2 = longitudeRad + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(latitudeRad), Math.cos(distance) - Math.sin(latitudeRad) * Math.sin(latitude2));
    coordinates.push([longitude2 * 180 / Math.PI, latitude2 * 180 / Math.PI]);
  }
  return { type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [coordinates] } };
}

export function pointFeature(longitude: number, latitude: number) {
  return { type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: [longitude, latitude] } };
}

/**
 * Source existence is the readiness signal for selection updates. MapLibre's
 * isStyleLoaded() can temporarily be false while raster tiles are loading,
 * even though these GeoJSON sources are already available and writable.
 */
export function syncMapSelectionSources(
  map: Pick<MapLibreMap, "getSource">,
  location: MapSelectionLocation,
  radiusKm: number,
) {
  const radiusSource = map.getSource("analysis-radius") as GeoJSONSource | undefined;
  const pointSource = map.getSource("selected-point") as GeoJSONSource | undefined;

  radiusSource?.setData(circlePolygon(location.longitude, location.latitude, radiusKm));
  pointSource?.setData(pointFeature(location.longitude, location.latitude));

  return { radiusUpdated: Boolean(radiusSource), pointUpdated: Boolean(pointSource) };
}

/**
 * Search results may be outside the current viewport, so selecting one should
 * move the camera. A direct map click is already visible and must keep the
 * current viewport stable so the pin remains where the user clicked.
 */
export function shouldRecenterForSelection(origin: MapSelectionOrigin) {
  return origin === "SEARCH";
}

import { OSM_BUILDING_QUERY } from "@/src/config/buildings";
import type { GeoPoint } from "@/src/domain/models";
import { getApiConnection } from "@/src/services/api-connection.service";

export type BuildingHeightSource = "OSM_HEIGHT" | "OSM_LEVELS_ESTIMATE" | "DEFAULT_ESTIMATE";

export interface BuildingFootprintProperties {
  osmId: number;
  name: string;
  heightMeters: number;
  minHeightMeters: number;
  heightSource: BuildingHeightSource;
  geometrySource: "OSM_FOOTPRINT" | "PHOTON_EXTENT" | "CENTROID_ESTIMATE";
  selected: boolean;
}

export interface BuildingFootprintFeature {
  type: "Feature";
  id: string;
  properties: BuildingFootprintProperties;
  geometry: { type: "Polygon"; coordinates: number[][][] };
}

export interface BuildingFootprintCollection {
  type: "FeatureCollection";
  features: BuildingFootprintFeature[];
}

interface OverpassBuilding {
  id: number;
  type: "way";
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
}

interface PhotonBuilding {
  properties?: { osm_id?: number; name?: string; extent?: [number, number, number, number] };
  geometry?: { type: "Point"; coordinates: [number, number] };
}

const buildingCache = new Map<string, BuildingFootprintCollection>();

function numericMeters(value?: string) {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 && parsed <= OSM_BUILDING_QUERY.maximumHeightMeters ? parsed : null;
}

function buildingHeight(tags: Record<string, string>) {
  const taggedHeight = numericMeters(tags.height);
  if (taggedHeight != null) return { heightMeters: taggedHeight, heightSource: "OSM_HEIGHT" as const };
  const levels = numericMeters(tags["building:levels"]);
  if (levels != null) return { heightMeters: levels * OSM_BUILDING_QUERY.floorHeightMeters, heightSource: "OSM_LEVELS_ESTIMATE" as const };
  return { heightMeters: OSM_BUILDING_QUERY.defaultHeightMeters, heightSource: "DEFAULT_ESTIMATE" as const };
}

function pointInsideRing(point: GeoPoint, ring: number[][]) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x, y] = ring[index];
    const [previousX, previousY] = ring[previous];
    const crosses = (y > point.latitude) !== (previousY > point.latitude)
      && point.longitude < ((previousX - x) * (point.latitude - y)) / (previousY - y || Number.EPSILON) + x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function centroidDistanceMeters(point: GeoPoint, ring: number[][]) {
  const usable = ring.slice(0, -1);
  const longitude = usable.reduce((sum, coordinate) => sum + coordinate[0], 0) / usable.length;
  const latitude = usable.reduce((sum, coordinate) => sum + coordinate[1], 0) / usable.length;
  const latitudeMeters = (latitude - point.latitude) * 111_320;
  const longitudeMeters = (longitude - point.longitude) * 111_320 * Math.cos(point.latitude * Math.PI / 180);
  return Math.hypot(latitudeMeters, longitudeMeters);
}

function selectNearestBuilding(features: BuildingFootprintFeature[], point: GeoPoint) {
  const containing = features.find((feature) => pointInsideRing(point, feature.geometry.coordinates[0]));
  const selected = containing ?? features
    .map((feature) => ({ feature, distance: centroidDistanceMeters(point, feature.geometry.coordinates[0]) }))
    .filter(({ distance }) => distance <= OSM_BUILDING_QUERY.selectedBuildingDistanceMeters)
    .sort((left, right) => left.distance - right.distance)[0]?.feature;
  if (selected) selected.properties.selected = true;
}

async function photonBuildingFootprints(point: GeoPoint): Promise<BuildingFootprintCollection> {
  const connection = getApiConnection("photon");
  if (!connection.enabled || !connection.endpoint) throw new Error("Photon building fallback disabled");
  const url = new URL(connection.endpoint);
  url.search = new URLSearchParams({
    lon: String(point.longitude), lat: String(point.latitude), radius: "2", osm_tag: "building", limit: "50",
  }).toString();
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), OSM_BUILDING_QUERY.clientTimeoutMs);
  try {
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" }, signal: controller.signal });
    if (!response.ok) throw new Error(`Photon building request ${response.status}`);
    const payload = await response.json() as { features?: PhotonBuilding[] };
    const seen = new Set<string>();
    const features = (payload.features ?? []).flatMap((feature, index): BuildingFootprintFeature[] => {
      const coordinates = feature.geometry?.coordinates;
      if (!coordinates || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return [];
      const osmId = feature.properties?.osm_id ?? index;
      const id = `photon-building-${osmId}`;
      if (seen.has(id)) return [];
      seen.add(id);
      const extent = feature.properties?.extent;
      const hasUsableExtent = extent?.length === 4 && extent.every(Number.isFinite)
        && Math.abs(extent[2] - extent[0]) <= 0.01 && Math.abs(extent[1] - extent[3]) <= 0.01;
      const longitudeDelta = 9 / (111_320 * Math.cos(point.latitude * Math.PI / 180));
      const latitudeDelta = 9 / 111_320;
      const [west, north, east, south] = hasUsableExtent
        ? extent
        : [coordinates[0] - longitudeDelta, coordinates[1] + latitudeDelta, coordinates[0] + longitudeDelta, coordinates[1] - latitudeDelta];
      return [{
        type: "Feature",
        id,
        properties: {
          osmId,
          name: feature.properties?.name || "OSM building",
          heightMeters: OSM_BUILDING_QUERY.defaultHeightMeters,
          minHeightMeters: 0,
          heightSource: "DEFAULT_ESTIMATE",
          geometrySource: hasUsableExtent ? "PHOTON_EXTENT" : "CENTROID_ESTIMATE",
          selected: false,
        },
        geometry: { type: "Polygon", coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]] },
      }];
    });
    selectNearestBuilding(features, point);
    return { type: "FeatureCollection", features };
  } finally {
    globalThis.clearTimeout(timer);
  }
}

export interface BuildingFootprintProvider {
  nearby(point: GeoPoint): Promise<BuildingFootprintCollection>;
}

export class OverpassBuildingFootprintProvider implements BuildingFootprintProvider {
  async nearby(point: GeoPoint): Promise<BuildingFootprintCollection> {
    const connection = getApiConnection("overpass");
    if (!connection.enabled || !connection.endpoint) throw new Error("Overpass building provider disabled");
    const cacheKey = `${point.latitude.toFixed(4)}:${point.longitude.toFixed(4)}:${connection.endpoint}`;
    const cached = buildingCache.get(cacheKey);
    if (cached) return structuredClone(cached);

    const around = `(around:${OSM_BUILDING_QUERY.radiusMeters},${point.latitude.toFixed(6)},${point.longitude.toFixed(6)})`;
    const query = `[out:json][timeout:${OSM_BUILDING_QUERY.timeoutSeconds}];way["building"]${around};out body geom qt ${OSM_BUILDING_QUERY.resultLimit};`;
    const endpoints = [connection.endpoint];
    let payload: { elements?: OverpassBuilding[] } | null = null;
    let lastError: unknown = null;
    for (const endpoint of endpoints) {
      const controller = new AbortController();
      const timer = globalThis.setTimeout(() => controller.abort(), OSM_BUILDING_QUERY.clientTimeoutMs);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: new URLSearchParams({ data: query }).toString(),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Overpass building request ${response.status}`);
        const candidate = await response.json() as { elements?: OverpassBuilding[] };
        if (!Array.isArray(candidate.elements)) throw new Error("Invalid Overpass building response");
        payload = candidate;
        break;
      } catch (error) {
        lastError = error;
      } finally {
        globalThis.clearTimeout(timer);
      }
    }
    if (!payload) {
      try {
        return await photonBuildingFootprints(point);
      } catch (photonError) {
        throw new Error(`OSM building providers unavailable (Overpass: ${lastError instanceof Error ? lastError.message : "request failed"}; Photon: ${photonError instanceof Error ? photonError.message : "request failed"})`);
      }
    }
    {
      const features = (payload.elements ?? []).flatMap((element): BuildingFootprintFeature[] => {
        const coordinates = (element.geometry ?? []).map((coordinate) => [coordinate.lon, coordinate.lat]);
        if (coordinates.length < 3) return [];
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) coordinates.push([...first]);
        const tags = element.tags ?? {};
        const height = buildingHeight(tags);
        const minHeight = numericMeters(tags.min_height)
          ?? (numericMeters(tags["building:min_level"]) ?? 0) * OSM_BUILDING_QUERY.floorHeightMeters;
        return [{
          type: "Feature",
          id: `osm-building-${element.id}`,
          properties: {
            osmId: element.id,
            name: tags.name || tags["addr:housename"] || "OSM building",
            heightMeters: Math.max(height.heightMeters, minHeight + 1),
            minHeightMeters: minHeight,
            heightSource: height.heightSource,
            geometrySource: "OSM_FOOTPRINT",
            selected: false,
          },
          geometry: { type: "Polygon", coordinates: [coordinates] },
        }];
      });
      if (!features.length) return photonBuildingFootprints(point);
      selectNearestBuilding(features, point);
      const collection: BuildingFootprintCollection = { type: "FeatureCollection", features };
      buildingCache.set(cacheKey, structuredClone(collection));
      return collection;
    }
  }
}

import type { GeoPoint, MapEntity } from "@/src/domain/models";
import type { HydrologySnapshot, PopulationSnapshot, PublicLocationContext, TrafficSnapshot, WeatherSnapshot } from "@/src/domain/public-api";
import { OVERPASS_RESULT_LIMITS, PHOTON_OSM_TAG_GROUPS, PHOTON_RESULT_LIMIT } from "@/src/config/overpass";
import { appendApiKey, getApiConnection, getApiConnectionRevision } from "@/src/services/api-connection.service";

const responseCache = new Map<string, PublicLocationContext>();

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function numberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface OverpassElement {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface PhotonFeature {
  type: "Feature";
  properties?: {
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    country?: string;
  };
  geometry?: { type: "Point"; coordinates: [number, number] };
}

function entityKind(tags: Record<string, string>): MapEntity["kind"] {
  if (tags.amenity === "charging_station") return "EV_STATION";
  if (tags.amenity === "fuel") return "GAS_STATION";
  return "POI";
}

function photonEntityKind(osmKey?: string, osmValue?: string): MapEntity["kind"] {
  if (osmKey === "amenity" && osmValue === "charging_station") return "EV_STATION";
  if (osmKey === "amenity" && osmValue === "fuel") return "GAS_STATION";
  return "POI";
}

export class PhotonPublicProvider {
  async nearby(point: GeoPoint, radiusKm: number): Promise<MapEntity[]> {
    const connection = getApiConnection("photon");
    if (!connection.enabled) throw new Error("Photon fallback disabled");
    const endpoint = connection.endpoint.replace(/\/$/, "");
    const results = await Promise.allSettled(PHOTON_OSM_TAG_GROUPS.map(async (osmTag) => {
      const url = new URL(endpoint);
      url.search = new URLSearchParams({
        lon: String(point.longitude),
        lat: String(point.latitude),
        radius: String(Math.max(1, Math.min(10, radiusKm))),
        osm_tag: osmTag,
        limit: String(PHOTON_RESULT_LIMIT)
      }).toString();
      const response = await fetchWithTimeout(url.toString(), { headers: { Accept: "application/json" } }, 9000);
      if (!response.ok) throw new Error(`Photon ${response.status}`);
      return response.json() as Promise<{ features?: PhotonFeature[] }>;
    }));
    const responses = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    if (!responses.length) throw new Error("All bounded Photon queries failed");
    const now = new Date().toISOString();
    const seen = new Set<string>();
    return responses.flatMap((payload) => payload.features ?? []).flatMap((feature) => {
      const properties = feature.properties ?? {};
      const coordinates = feature.geometry?.coordinates;
      if (!coordinates || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return [];
      const sourceId = `${properties.osm_type ?? "feature"}-${properties.osm_id ?? `${coordinates[0]}-${coordinates[1]}`}`;
      if (seen.has(sourceId)) return [];
      seen.add(sourceId);
      const kind = photonEntityKind(properties.osm_key, properties.osm_value);
      return [{
        id: `photon-osm-${sourceId}`,
        kind,
        name: properties.name || (kind === "EV_STATION" ? "OSM charging station" : kind === "GAS_STATION" ? "OSM fuel station" : "OSM point of interest"),
        address: [properties.housenumber, properties.street, properties.district, properties.city].filter(Boolean).join(" ") || "Address unavailable",
        longitude: coordinates[0],
        latitude: coordinates[1],
        poiType: kind === "POI" ? properties.osm_value || properties.osm_key || "other" : undefined,
        provenance: {
          source: "OpenStreetMap via Photon",
          sourceUrl: "https://www.openstreetmap.org/",
          collectedAt: now,
          lastUpdated: now,
          confidence: "MEDIUM" as const,
          verifiedStatus: "APPROXIMATE" as const
        }
      } satisfies MapEntity];
    });
  }
}

export class OverpassPublicProvider {
  async nearby(point: GeoPoint, radiusKm: number): Promise<MapEntity[]> {
    const connection = getApiConnection("overpass");
    if (!connection.enabled) return new PhotonPublicProvider().nearby(point, radiusKm);
    const radiusMeters = Math.round(Math.max(1, Math.min(10, radiusKm)) * 1000);
    const around = `(around:${radiusMeters},${point.latitude.toFixed(6)},${point.longitude.toFixed(6)})`;
    const query = `[out:json][timeout:12];nwr["amenity"="charging_station"]${around};out center tags ${OVERPASS_RESULT_LIMITS.evStations};nwr["amenity"="fuel"]${around};out center tags ${OVERPASS_RESULT_LIMITS.gasStations};(nwr["amenity"~"restaurant|hospital|school|university|parking"]${around};nwr["shop"~"mall|supermarket|convenience"]${around};nwr["tourism"~"hotel|attraction"]${around};);out center tags ${OVERPASS_RESULT_LIMITS.pois};`;
    let elements: OverpassElement[];
    try {
      const response = await fetchWithTimeout(connection.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({ data: query }).toString()
      }, 9000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { elements?: OverpassElement[] };
      if (!Array.isArray(payload.elements)) throw new Error("Invalid JSON payload");
      elements = payload.elements;
    } catch (overpassError) {
      try {
        return await new PhotonPublicProvider().nearby(point, radiusKm);
      } catch (photonError) {
        throw new Error(`Nearby OSM providers unavailable (Overpass: ${overpassError instanceof Error ? overpassError.message : "request failed"}; Photon: ${photonError instanceof Error ? photonError.message : "request failed"})`);
      }
    }
    const now = new Date().toISOString();
    return elements.flatMap((element) => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;
      if (latitude == null || longitude == null) return [];
      const tags = element.tags ?? {};
      const kind = entityKind(tags);
      return [{
        id: `osm-${element.type}-${element.id}`,
        kind,
        name: tags.name || tags.brand || (kind === "EV_STATION" ? "OSM charging station" : kind === "GAS_STATION" ? "OSM fuel station" : "OSM point of interest"),
        brand: tags.brand || tags.operator,
        address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(" ") || "Address unavailable",
        latitude,
        longitude,
        chargerCount: kind === "EV_STATION" ? numberOrNull(tags.capacity) ?? undefined : undefined,
        chargerType: tags.socket || tags["socket:type2"] ? "Connector information available in OSM" : undefined,
        parkingSpaces: kind === "POI" && tags.capacity ? numberOrNull(tags.capacity) ?? undefined : undefined,
        poiType: kind === "POI" ? tags.amenity || tags.shop || tags.tourism || "other" : undefined,
        existingEvChargers: kind === "GAS_STATION" ? tags["fuel:electricity"] === "yes" : undefined,
        provenance: {
          source: "OpenStreetMap via Overpass API",
          sourceUrl: "https://www.openstreetmap.org/",
          collectedAt: now,
          lastUpdated: now,
          confidence: "MEDIUM" as const,
          verifiedStatus: "APPROXIMATE" as const
        }
      } satisfies MapEntity];
    });
  }
}

export class OpenMeteoPublicProvider {
  async weather(point: GeoPoint): Promise<WeatherSnapshot> {
    const connection = getApiConnection("open-meteo-weather");
    if (!connection.enabled) throw new Error("Open-Meteo weather disabled");
    const url = new URL(`${connection.endpoint.replace(/\/$/, "")}/v1/forecast`);
    url.search = new URLSearchParams({
      latitude: String(point.latitude), longitude: String(point.longitude),
      current: "temperature_2m,precipitation,wind_speed_10m,weather_code", timezone: "Asia/Bangkok"
    }).toString();
    const response = await fetchWithTimeout(appendApiKey(url, connection.token).toString());
    if (!response.ok) throw new Error(`Open-Meteo weather ${response.status}`);
    const data = await response.json() as { current?: Record<string, unknown> };
    return {
      temperatureC: numberOrNull(data.current?.temperature_2m),
      precipitationMm: numberOrNull(data.current?.precipitation),
      windSpeedKmh: numberOrNull(data.current?.wind_speed_10m),
      weatherCode: numberOrNull(data.current?.weather_code)
    };
  }

  async elevation(point: GeoPoint): Promise<number | null> {
    const connection = getApiConnection("open-meteo-elevation");
    if (!connection.enabled) throw new Error("Open-Meteo elevation disabled");
    const url = new URL(`${connection.endpoint.replace(/\/$/, "")}/v1/elevation`);
    url.search = new URLSearchParams({ latitude: String(point.latitude), longitude: String(point.longitude) }).toString();
    const response = await fetchWithTimeout(appendApiKey(url, connection.token).toString());
    if (!response.ok) throw new Error(`Open-Meteo elevation ${response.status}`);
    const data = await response.json() as { elevation?: unknown[] };
    return numberOrNull(data.elevation?.[0]);
  }

  async hydrology(point: GeoPoint): Promise<HydrologySnapshot> {
    const connection = getApiConnection("open-meteo-flood");
    if (!connection.enabled) throw new Error("Open-Meteo flood disabled");
    const url = new URL(`${connection.endpoint.replace(/\/$/, "")}/v1/flood`);
    url.search = new URLSearchParams({
      latitude: String(point.latitude), longitude: String(point.longitude),
      daily: "river_discharge", forecast_days: "7"
    }).toString();
    const response = await fetchWithTimeout(appendApiKey(url, connection.token).toString(), undefined, 12000);
    if (!response.ok) throw new Error(`Open-Meteo flood ${response.status}`);
    const data = await response.json() as { daily?: { river_discharge?: Array<number | null> } };
    const values = (data.daily?.river_discharge ?? []).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    return {
      currentRiverDischargeM3s: values[0] ?? null,
      maxSevenDayRiverDischargeM3s: values.length ? Math.max(...values) : null,
      modelResolutionKm: 5
    };
  }
}

function radiusPolygon(point: GeoPoint, radiusKm: number) {
  const coordinates: number[][] = [];
  const earthRadiusKm = 6371;
  for (let index = 0; index <= 32; index += 1) {
    const bearing = index * 360 / 32 * Math.PI / 180;
    const latitude = point.latitude * Math.PI / 180;
    const longitude = point.longitude * Math.PI / 180;
    const distance = Math.max(1, Math.min(10, radiusKm)) / earthRadiusKm;
    const latitude2 = Math.asin(Math.sin(latitude) * Math.cos(distance) + Math.cos(latitude) * Math.sin(distance) * Math.cos(bearing));
    const longitude2 = longitude + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(latitude), Math.cos(distance) - Math.sin(latitude) * Math.sin(latitude2));
    coordinates.push([longitude2 * 180 / Math.PI, latitude2 * 180 / Math.PI]);
  }
  return { type: "Polygon", coordinates: [coordinates] };
}

export class WorldPopPublicProvider {
  async population(point: GeoPoint, radiusKm: number): Promise<PopulationSnapshot> {
    const connection = getApiConnection("worldpop");
    if (!connection.enabled) throw new Error("WorldPop disabled");
    const endpoint = connection.endpoint.replace(/\/$/, "");
    const response = await fetchWithTimeout(`${endpoint}/population`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(connection.token ? { "X-API-Key": connection.token } : {}) },
      body: JSON.stringify({ geojson: radiusPolygon(point, radiusKm), year: 2025, resolution: "100m" })
    }, 12000);
    if (!response.ok) throw new Error(`WorldPop ${response.status}`);
    const submitted = await response.json() as { task_id?: string };
    if (!submitted.task_id) throw new Error("WorldPop task ID unavailable");
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      const taskResponse = await fetchWithTimeout(`${endpoint}/tasks/${encodeURIComponent(submitted.task_id)}`, {
        headers: { Accept: "application/json", ...(connection.token ? { "X-API-Key": connection.token } : {}) }
      });
      if (!taskResponse.ok) throw new Error(`WorldPop task ${taskResponse.status}`);
      const task = await taskResponse.json() as { status?: string; error?: string; result?: { total_population?: number; population_density?: number; area_km2?: number; data_year?: number; data_source?: string } };
      if (task.status === "failure") throw new Error(task.error || "WorldPop task failed");
      if (task.status === "success" && task.result) return {
        totalPopulation: numberOrNull(task.result.total_population),
        densityPerKm2: numberOrNull(task.result.population_density),
        areaKm2: numberOrNull(task.result.area_km2),
        dataYear: task.result.data_year ?? 2025,
        source: task.result.data_source || "WorldPop Global 2 Population Data"
      };
    }
    throw new Error("WorldPop task timed out");
  }
}

export class TomTomTrafficProvider {
  async traffic(point: GeoPoint): Promise<TrafficSnapshot> {
    const connection = getApiConnection("tomtom-traffic");
    if (!connection.enabled || !connection.token) throw new Error("TomTom traffic API key not configured");
    const url = new URL(connection.endpoint);
    url.search = new URLSearchParams({
      point: `${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`,
      unit: "KMPH", openLr: "false", key: connection.token
    }).toString();
    const response = await fetchWithTimeout(url.toString(), undefined, 10000);
    if (!response.ok) throw new Error(`TomTom traffic ${response.status}`);
    const data = await response.json() as { flowSegmentData?: Record<string, unknown> };
    return {
      currentSpeedKmh: numberOrNull(data.flowSegmentData?.currentSpeed),
      freeFlowSpeedKmh: numberOrNull(data.flowSegmentData?.freeFlowSpeed),
      confidence: numberOrNull(data.flowSegmentData?.confidence),
      roadClosure: typeof data.flowSegmentData?.roadClosure === "boolean" ? data.flowSegmentData.roadClosure : null
    };
  }
}

export async function getPublicLocationContext(point: GeoPoint, radiusKm: number): Promise<PublicLocationContext> {
  const cacheKey = `${getApiConnectionRevision()}:${point.latitude.toFixed(4)}:${point.longitude.toFixed(4)}:${radiusKm}`;
  const cached = responseCache.get(cacheKey);
  if (cached) return { ...cached, cached: true };
  const overpass = new OverpassPublicProvider();
  const openMeteo = new OpenMeteoPublicProvider();
  const worldPop = new WorldPopPublicProvider();
  const tomTom = new TomTomTrafficProvider();
  const [osm, weather, elevation, hydrology, population, traffic] = await Promise.allSettled([
    overpass.nearby(point, radiusKm), openMeteo.weather(point), openMeteo.elevation(point), openMeteo.hydrology(point),
    worldPop.population(point, radiusKm), tomTom.traffic(point)
  ]);
  const errors: string[] = [];
  if (osm.status === "rejected") errors.push("Nearby OSM data unavailable");
  if (weather.status === "rejected") errors.push("Weather snapshot unavailable");
  if (elevation.status === "rejected") errors.push("Elevation unavailable");
  if (hydrology.status === "rejected") errors.push("River-discharge context unavailable");
  if (population.status === "rejected") errors.push("WorldPop population unavailable");
  if (traffic.status === "rejected") errors.push("TomTom traffic unavailable or API key not configured");
  const context: PublicLocationContext = {
    osmEntities: osm.status === "fulfilled" ? osm.value : [],
    weather: weather.status === "fulfilled" ? weather.value : null,
    elevationMeters: elevation.status === "fulfilled" ? elevation.value : null,
    hydrology: hydrology.status === "fulfilled" ? hydrology.value : null,
    population: population.status === "fulfilled" ? population.value : null,
    traffic: traffic.status === "fulfilled" ? traffic.value : null,
    fetchedAt: new Date().toISOString(), errors, cached: false
  };
  if (errors.length < 6) responseCache.set(cacheKey, context);
  return context;
}

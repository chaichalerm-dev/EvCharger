import type { GeoPoint, MapEntity } from "@/src/domain/models";
import type { HydrologySnapshot, PublicLocationContext, WeatherSnapshot } from "@/src/domain/public-api";

const OVERPASS_ENDPOINT = process.env.NEXT_PUBLIC_OVERPASS_ENDPOINT || "https://overpass-api.de/api/interpreter";
const OPEN_METEO_BASE_URL = process.env.NEXT_PUBLIC_OPEN_METEO_BASE_URL || "https://api.open-meteo.com";
const FLOOD_API_BASE_URL = process.env.NEXT_PUBLIC_OPEN_METEO_FLOOD_BASE_URL || "https://flood-api.open-meteo.com";
const ELEVATION_API_BASE_URL = process.env.NEXT_PUBLIC_OPEN_METEO_ELEVATION_BASE_URL || "https://api.open-meteo.com";

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

function entityKind(tags: Record<string, string>): MapEntity["kind"] {
  if (tags.amenity === "charging_station") return "EV_STATION";
  if (tags.amenity === "fuel") return "GAS_STATION";
  return "POI";
}

export class OverpassPublicProvider {
  async nearby(point: GeoPoint, radiusKm: number): Promise<MapEntity[]> {
    const radiusMeters = Math.round(Math.max(1, Math.min(10, radiusKm)) * 1000);
    const around = `(around:${radiusMeters},${point.latitude.toFixed(6)},${point.longitude.toFixed(6)})`;
    const query = `[out:json][timeout:12];(nwr["amenity"="charging_station"]${around};nwr["amenity"="fuel"]${around};nwr["amenity"~"restaurant|hospital|school|university|parking"]${around};nwr["shop"~"mall|supermarket|convenience"]${around};nwr["tourism"~"hotel|attraction"]${around};);out center tags 120;`;
    const response = await fetchWithTimeout(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ data: query }).toString()
    }, 14000);
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    const payload = await response.json() as { elements?: OverpassElement[] };
    const now = new Date().toISOString();
    return (payload.elements ?? []).flatMap((element) => {
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
    const url = new URL(`${OPEN_METEO_BASE_URL}/v1/forecast`);
    url.search = new URLSearchParams({
      latitude: String(point.latitude), longitude: String(point.longitude),
      current: "temperature_2m,precipitation,wind_speed_10m,weather_code", timezone: "Asia/Bangkok"
    }).toString();
    const response = await fetchWithTimeout(url.toString());
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
    const url = new URL(`${ELEVATION_API_BASE_URL}/v1/elevation`);
    url.search = new URLSearchParams({ latitude: String(point.latitude), longitude: String(point.longitude) }).toString();
    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) throw new Error(`Open-Meteo elevation ${response.status}`);
    const data = await response.json() as { elevation?: unknown[] };
    return numberOrNull(data.elevation?.[0]);
  }

  async hydrology(point: GeoPoint): Promise<HydrologySnapshot> {
    const url = new URL(`${FLOOD_API_BASE_URL}/v1/flood`);
    url.search = new URLSearchParams({
      latitude: String(point.latitude), longitude: String(point.longitude),
      daily: "river_discharge", forecast_days: "7"
    }).toString();
    const response = await fetchWithTimeout(url.toString(), undefined, 12000);
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

export async function getPublicLocationContext(point: GeoPoint, radiusKm: number): Promise<PublicLocationContext> {
  const cacheKey = `${point.latitude.toFixed(4)}:${point.longitude.toFixed(4)}:${radiusKm}`;
  const cached = responseCache.get(cacheKey);
  if (cached) return { ...cached, cached: true };
  const overpass = new OverpassPublicProvider();
  const openMeteo = new OpenMeteoPublicProvider();
  const [osm, weather, elevation, hydrology] = await Promise.allSettled([
    overpass.nearby(point, radiusKm), openMeteo.weather(point), openMeteo.elevation(point), openMeteo.hydrology(point)
  ]);
  const errors: string[] = [];
  if (osm.status === "rejected") errors.push("Nearby OSM data unavailable");
  if (weather.status === "rejected") errors.push("Weather snapshot unavailable");
  if (elevation.status === "rejected") errors.push("Elevation unavailable");
  if (hydrology.status === "rejected") errors.push("River-discharge context unavailable");
  const context: PublicLocationContext = {
    osmEntities: osm.status === "fulfilled" ? osm.value : [],
    weather: weather.status === "fulfilled" ? weather.value : null,
    elevationMeters: elevation.status === "fulfilled" ? elevation.value : null,
    hydrology: hydrology.status === "fulfilled" ? hydrology.value : null,
    fetchedAt: new Date().toISOString(), errors, cached: false
  };
  if (errors.length < 4) responseCache.set(cacheKey, context);
  return context;
}

import type { GeocodingProvider } from "./interfaces";
import { getApiConnection } from "@/src/services/api-connection.service";

interface NominatimResult { display_name: string; lat: string; lon: string }

const searchCache = new Map<string, Array<{ label: string; latitude: number; longitude: number }>>();
let lastRequestAt = 0;

export class NominatimGeocodingProvider implements GeocodingProvider {
  async search(query: string) {
    const connection = getApiConnection("nominatim");
    if (!connection.enabled) return [];
    const normalized = query.trim().slice(0, 160);
    if (normalized.length < 2) return [];
    const cacheKey = normalized.toLocaleLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached) return structuredClone(cached);

    const waitMs = Math.max(0, 1050 - (Date.now() - lastRequestAt));
    if (waitMs) await new Promise((resolve) => window.setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();
    const url = new URL(connection.endpoint);
    url.search = new URLSearchParams({
      q: normalized,
      format: "jsonv2",
      countrycodes: "th",
      limit: "5",
      "accept-language": "th,en"
    }).toString();

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) return [];
      const rows = await response.json() as NominatimResult[];
      const results = rows.map((row) => ({
        label: row.display_name,
        latitude: Number(row.lat),
        longitude: Number(row.lon)
      })).filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));
      searchCache.set(cacheKey, results);
      return structuredClone(results);
    } catch {
      return [];
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

import type { GeocodingProvider } from "./interfaces";

interface NominatimResult { display_name: string; lat: string; lon: string }

export class NominatimGeocodingProvider implements GeocodingProvider {
  async search(query: string) {
    const normalized = query.trim().slice(0, 160);
    if (normalized.length < 2) return [];

    const url = new URL("https://nominatim.openstreetmap.org/search");
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
      return rows.map((row) => ({
        label: row.display_name,
        latitude: Number(row.lat),
        longitude: Number(row.lon)
      })).filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));
    } catch {
      return [];
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

import type { GeocodingProvider } from "./interfaces";
import { getApiConnection } from "@/src/services/api-connection.service";

interface NominatimResult { display_name: string; lat: string; lon: string }

const searchCache = new Map<string, Array<{ label: string; latitude: number; longitude: number }>>();
// อยู่ระดับ module เพื่อให้การหน่วง 1 request/วินาทีด้านล่างมีผลกับทุกผู้เรียก ไม่ใช่แค่ instance เดียว
let lastRequestAt = 0;

export class NominatimGeocodingProvider implements GeocodingProvider {
  async search(query: string) {
    const connection = getApiConnection("nominatim");
    if (!connection.enabled) return [];
    const normalized = query.trim().slice(0, 160);
    if (normalized.length < 2) return [];
    const cacheKey = normalized.toLocaleLowerCase();
    const cached = searchCache.get(cacheKey);
    // clone ก่อนคืนค่า เพื่อไม่ให้ผู้เรียกแก้ไข array แล้วไปกระทบข้อมูลใน cache ที่ใช้ร่วมกัน
    if (cached) return structuredClone(cached);

    // นโยบายการใช้งานของ Nominatim จำกัด request สาธารณะที่ 1 ครั้ง/วินาที เผื่อเวลาไว้ 1050ms กันชน
    const waitMs = Math.max(0, 1050 - (Date.now() - lastRequestAt));
    if (waitMs) await new Promise((resolve) => window.setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();
    const url = new URL(connection.endpoint);
    url.search = new URLSearchParams({
      q: normalized,
      format: "jsonv2",
      countrycodes: "th", // จำกัดขอบเขตการค้นหาเฉพาะประเทศไทยตามขอบเขตผลิตภัณฑ์ ไม่ใช่ค่า default ของ Nominatim
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
      // เครือข่ายล้มเหลว, abort หรือ JSON ผิดรูปแบบ ให้ตกไปเป็น "ไม่พบผล" — geocoding เป็นแค่ทางเลือก
      // ผู้ใช้ยังคลิกเลือกจุดบนแผนที่เองได้
      return [];
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

import type { FloodRiskLevel, GeoPoint, MapEntity } from "@/src/domain/models";

// เป็น contract เท่านั้น ไม่มี fetch/URL อยู่ในนี้ เพื่อให้ service พึ่งพา interface นี้
// แทน provider จริง และสลับ implementation ได้โดยไม่ต้องแก้โค้ดที่เรียกใช้
export interface MapProvider {
  getStyleUrl(): string;
}
export interface EVStationProvider {
  nearby(point: GeoPoint, radiusKm: number): Promise<MapEntity[]>;
}
export interface POIProvider {
  nearby(point: GeoPoint, radiusKm: number): Promise<MapEntity[]>;
}
export interface FloodRiskProvider {
  at(point: GeoPoint): Promise<FloodRiskLevel | "UNKNOWN">;
}
export interface TrafficProvider {
  levelAt(point: GeoPoint): Promise<"LOW" | "MEDIUM" | "HIGH" | "UNKNOWN">;
}
export interface WeatherProvider {
  summaryAt(point: GeoPoint): Promise<string>;
}
export interface PopulationProvider {
  densityAt(point: GeoPoint): Promise<number | null>;
}
export interface GeocodingProvider {
  search(query: string): Promise<Array<GeoPoint & { label: string }>>;
}

import type { GeoPoint, MapEntity, Site } from "@/src/domain/models";
import type { PublicLocationContext } from "@/src/domain/public-api";

const clamp = (value: number, min = 0, max = 100) => Math.round(Math.max(min, Math.min(max, value)));

// ระยะทางแบบ Haversine (เส้นวงกลมใหญ่) เหมาะกับรัศมีในต้นแบบ ไม่ใช่ geodesy แบบแม่นยำ
// (ตามกฎ GIS ใน AI.md — งานคำนวณระยะทาง/intersection จริงควรใช้ PostGIS)
export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const lat1 = a.latitude * rad;
  const lat2 = b.latitude * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface LocationAnalysisInput extends GeoPoint { label: string; radiusKm: number; areaSqm?: number; }
export interface LocationAnalysisResult {
  site: Site;
  nearby: MapEntity[];
  counts: { evStations: number; competitors: number; gasStations: number; pois: number; partnerBranches: number };
  nearestCompetitor: MapEntity | null;
  estimated: boolean;
}

export function analyzeRealLocation(input: LocationAnalysisInput, context: PublicLocationContext | null): LocationAnalysisResult {
  const nearby = context?.osmEntities ?? [];
  const point = { latitude: input.latitude, longitude: input.longitude };
  const ofKind = (kind: MapEntity["kind"]) => nearby.filter(entity => entity.kind === kind);
  // OSM ไม่มี tag "คู่แข่ง" โดยตรง จึงถือว่าสถานี EV_STATION ที่อยู่ใกล้ทุกจุดคือคู่แข่ง
  // (ใช้ evStations.length ซ้ำทั้งใน counts.competitors และ competitorsNearby ด้านล่าง)
  const evStations = ofKind("EV_STATION");
  const gasStations = ofKind("GAS_STATION");
  const pois = ofKind("POI");
  const nearestCompetitor = [...evStations].sort((a, b) => distanceKm(point, a) - distanceKm(point, b))[0] ?? null;
  const density = context?.population?.densityPerKm2 ?? null;
  const speedRatio = context?.traffic?.currentSpeedKmh != null && context.traffic.freeFlowSpeedKmh ? context.traffic.currentSpeedKmh / context.traffic.freeFlowSpeedKmh : null;
  // ทุกปัจจัยด้านล่างใช้ค่ากลาง 50 เป็นค่าเริ่มต้นเมื่อยังไม่มีข้อมูลจาก provider (ก่อนกดวิเคราะห์)
  // แทนที่จะเป็น 0 — พื้นที่ที่ยังไม่ได้วิเคราะห์ต้องไม่ดูเหมือนพื้นที่แย่
  // ใช้ scale แบบ log: ความหนาแน่นต่างกันมีผลน้อยลงเมื่อประชากรสูง มีผลมากขึ้นเมื่อประชากรต่ำ
  const demand = context ? clamp(density == null ? 50 : 35 + Math.log10(Math.max(1, density)) * 13) : 50;
  // ยิ่งมีสถานี EV คู่แข่งใกล้เคียงมาก คะแนนการแข่งขันยิ่งต่ำ (แต่ละสถานีลด 8 คะแนน)
  const competition = context ? clamp(92 - evStations.length * 8) : 50;
  // speedRatio = ความเร็วปัจจุบัน/ความเร็วไหลลื่น ยิ่งใกล้ 1 ยิ่งหมายถึงถนนไม่ติด (เข้าถึงง่ายกว่า)
  const accessibility = context ? clamp(speedRatio == null ? 50 : 45 + speedRatio * 45) : 50;
  const poi = context ? clamp(35 + Math.min(60, pois.length * 2 + gasStations.length * 4)) : 50;
  // ช่วงพื้นที่อ้างอิงคร่าวๆ ตามระดับ minAreaSqm ใน STATION_CONFIGURATIONS (config/business.ts)
  const areaFactor = input.areaSqm == null ? 50 : input.areaSqm >= 900 ? 96 : input.areaSqm >= 500 ? 84 : input.areaSqm >= 150 ? 68 : 45;
  const businessPotential = clamp((demand + accessibility + poi + competition) / 4);
  const now = context?.fetchedAt ?? new Date().toISOString();
  const site: Site = {
    id: `real-analysis-${input.latitude.toFixed(5)}-${input.longitude.toFixed(5)}`,
    name: input.label, nameTh: input.label, address: input.label, addressTh: input.label,
    latitude: input.latitude, longitude: input.longitude, province: "Thailand", provinceTh: "ประเทศไทย",
    district: "Requires reverse-geocoding verification", districtTh: "ต้องตรวจสอบเขตจาก Reverse Geocoding",
    areaSqm: input.areaSqm, areaVerified: false, siteType: "Selected coordinate", businessModel: "PARTNER_HOST",
    trafficLevel: speedRatio == null ? "MEDIUM" : speedRatio < .55 ? "HIGH" : speedRatio < .8 ? "MEDIUM" : "LOW",
    // หมายเหตุ: floodRisk/factors.floodRisk ด้านล่างเป็นค่าคงที่ชั่วคราว — ฟังก์ชันนี้ยังไม่ได้อ่าน
    // context.hydrology จึงยังไม่เชื่อมข้อมูลการไหลของแม่น้ำเข้ากับระดับความเสี่ยงหรือคะแนนจริง
    // ใครจะเชื่อมคะแนนน้ำท่วมจริงต้องมาเติมส่วนนี้
    populationDensity: density == null ? undefined : Math.round(density), floodRisk: "MEDIUM",
    elevationMeters: context?.elevationMeters ?? undefined, powerAvailability: "Requires Site Survey",
    competitorsNearby: evStations.length,
    nearestCompetitorKm: nearestCompetitor ? Number(distanceKm(point, nearestCompetitor).toFixed(1)) : 0,
    competitorBrands: [...new Set(evStations.map(entity => entity.brand).filter(Boolean))] as string[],
    poiCounts: { nearby: pois.length },
    // infrastructure และ floodRisk คงค่ากลาง (50) ไว้ก่อน — ยังไม่มี provider ป้อนข้อมูลจริง
    // จึงไม่ทำให้คะแนนรวมสูงหรือต่ำเกินจริงจนกว่าจะมีแหล่งข้อมูลนั้น
    factors: { demand, competition, accessibility, poi, infrastructure: 50, floodRisk: 50, siteArea: areaFactor, businessPotential },
    provenance: {
      source: context ? "Public provider snapshot" : "Awaiting public provider request",
      sourceUrl: context ? "https://www.openstreetmap.org/" : undefined,
      collectedAt: now, lastUpdated: now,
      confidence: context?.population && context?.traffic ? "MEDIUM" : "LOW",
      verifiedStatus: context ? "ESTIMATED" : "UNVERIFIED",
    },
    opportunityStatus: "LEAD",
  };
  return { site, nearby, counts: { evStations: evStations.length, competitors: evStations.length, gasStations: gasStations.length, pois: pois.length, partnerBranches: 0 }, nearestCompetitor, estimated: true };
}

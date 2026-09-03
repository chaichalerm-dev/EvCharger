export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type VerifiedStatus = "VERIFIED" | "ESTIMATED" | "APPROXIMATE" | "UNVERIFIED" | "EXPIRED";
export type FloodRiskLevel = "LOW" | "MEDIUM" | "HIGH";
// REQUIRES_SITE_SURVEY และ NOT_RECOMMENDED ไม่ใช่รูปแบบสถานีจริง แต่เป็นผลลัพธ์ของ recommendation-engine.ts
// เมื่อความเสี่ยงร้ายแรง (เช่นน้ำท่วมสูง) override คะแนน — ดู StationConfiguration ที่ตัดสองค่านี้ออก
export type StationType =
  "CHARGING_POINT" | "EV_HUB" | "FULL_EV_STATION" | "REQUIRES_SITE_SURVEY" | "NOT_RECOMMENDED";
export type BusinessModel = "COMPANY_OWNED" | "FRANCHISE" | "PARTNER_HOST" | "BRANCH_EXPANSION";
export type OpportunityStatus =
  | "LEAD"
  | "SUBMITTED"
  | "UNDER_ANALYSIS"
  | "QUALIFIED"
  | "SITE_SURVEY"
  | "APPROVED"
  | "REJECTED"
  | "CONTRACT"
  | "CONSTRUCTION"
  | "INSTALLED"
  | "OPERATIONAL";
// ติดมากับทุกค่าที่มาจาก provider ภายนอก เพื่อให้ UI แสดง source/ความมั่นใจ/สถานะตรวจสอบได้
// แทนที่จะนำเสนอเป็นข้อเท็จจริงเฉยๆ — ตามกฎข้อมูลใน AI.md
export interface DataProvenance {
  source: string;
  sourceUrl?: string;
  collectedAt: string;
  lastUpdated: string;
  confidence: Confidence;
  verifiedStatus: VerifiedStatus;
}
export interface GeoPoint {
  latitude: number;
  longitude: number;
}
export interface ScoreFactors {
  demand: number;
  competition: number;
  accessibility: number;
  poi: number;
  infrastructure: number;
  // ค่านี้เป็นคะแนน "ความปลอดภัย" จากน้ำท่วม ยิ่งสูงยิ่งปลอดภัย — ตรงข้ามกับ Site.floodRisk
  // ด้านล่างที่เป็นป้ายระดับความเสี่ยง (LOW/MEDIUM/HIGH ยิ่งสูงยิ่งเสี่ยง) อย่าสับสนสองค่านี้
  floodRisk: number;
  siteArea: number;
  businessPotential: number;
}
export interface Site extends GeoPoint {
  id: string;
  name: string;
  nameTh: string;
  address: string;
  addressTh: string;
  province: string;
  provinceTh: string;
  district: string;
  districtTh: string;
  // areaSqm อาจเป็นค่าประมาณ; areaVerified บอกว่าตรวจสอบจริงแล้วหรือยัง ห้ามแสดง estimated เป็น verified
  areaSqm?: number;
  areaVerified: boolean;
  siteType: string;
  businessModel: BusinessModel;
  trafficLevel: "LOW" | "MEDIUM" | "HIGH";
  populationDensity?: number;
  evAdoptionEstimate?: number;
  floodRisk: FloodRiskLevel;
  elevationMeters?: number;
  nearestHighwayKm?: number;
  parkingSpaces?: number;
  powerAvailability?: string;
  transformerDistanceMeters?: number;
  competitorsNearby: number;
  nearestCompetitorKm: number;
  competitorBrands: string[];
  poiCounts: Record<string, number>;
  factors: ScoreFactors;
  provenance: DataProvenance;
  opportunityStatus: OpportunityStatus;
}
export interface MapEntity extends GeoPoint {
  id: string;
  kind: "EV_STATION" | "COMPETITOR" | "GAS_STATION" | "POI" | "PARTNER_BRANCH";
  name: string;
  brand?: string;
  address: string;
  chargerCount?: number;
  chargerType?: string;
  chargingPowerKw?: number;
  parkingSpaces?: number;
  estimatedAreaSqm?: number;
  availableAreaSqm?: number;
  existingEvChargers?: boolean;
  poiType?: string;
  provenance: DataProvenance;
}
export interface SiteScore {
  overall: number;
  factors: ScoreFactors;
  calculatedAt: string;
  configurationVersion: string;
}
export interface Recommendation {
  label:
    | "EXCELLENT"
    | "HIGH_POTENTIAL"
    | "POTENTIAL"
    | "LOW_POTENTIAL"
    | "NOT_RECOMMENDED"
    | "REQUIRES_INVESTIGATION";
  stationType: StationType;
  reasons: string[];
  risks: string[];
  missingInformation: string[];
  // true เมื่อความเสี่ยงร้ายแรง (เช่นน้ำท่วมสูง) override คะแนนที่คำนวณได้ — ดู recommendation-engine.ts
  overridden: boolean;
}
export interface StationConfiguration {
  type: Exclude<StationType, "REQUIRES_SITE_SURVEY" | "NOT_RECOMMENDED">;
  label: string;
  minAreaSqm: number;
  recommendedAreaSqm: number;
  chargerRange: [number, number];
  parkingRange: [number, number];
  description: string;
}
export interface Partner {
  id: string;
  name: string;
  type: "FRANCHISE" | "LANDOWNER" | "HOST" | "COMMERCIAL_PARTNER" | "STRATEGIC_PARTNER";
  contact: string;
  businessType: string;
  contractStatus: string;
  branchCount: number;
  status: "ACTIVE" | "PROSPECT" | "INACTIVE";
}
export interface Branch extends GeoPoint {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  province: string;
  district: string;
  availableAreaSqm?: number;
  parkingSpaces?: number;
  businessType: string;
  existingEvChargers: boolean;
  electricalStatus: string;
  siteScore: number;
  recommendedStation: StationType;
  installationStatus: OpportunityStatus;
}

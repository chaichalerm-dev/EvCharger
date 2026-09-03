import type { StationConfiguration } from "@/src/domain/models";
// รายชื่อจังหวัดตัวอย่างสำหรับต้นแบบ ไม่ใช่ขอบเขตประเทศไทยทั้งหมด — ใช้แค่จุดอ้างอิงในบาง UI
export const GEOGRAPHIC_COVERAGE = [
  { code: "BKK", country: "TH", name: "Bangkok", nameTh: "กรุงเทพมหานคร" },
  { code: "NBI", country: "TH", name: "Nonthaburi", nameTh: "นนทบุรี" },
  { code: "SPK", country: "TH", name: "Samut Prakan", nameTh: "สมุทรปราการ" },
  { code: "CBI", country: "TH", name: "Chonburi", nameTh: "ชลบุรี" },
  { code: "RYG", country: "TH", name: "Rayong", nameTh: "ระยอง" },
  { code: "CMI", country: "TH", name: "Chiang Mai", nameTh: "เชียงใหม่" },
  { code: "PKT", country: "TH", name: "Phuket", nameTh: "ภูเก็ต" },
  { code: "NMA", country: "TH", name: "Nakhon Ratchasima", nameTh: "นครราชสีมา" },
  { code: "KKN", country: "TH", name: "Khon Kaen", nameTh: "ขอนแก่น" },
  { code: "AYA", country: "TH", name: "Ayutthaya", nameTh: "พระนครศรีอยุธยา" },
  { code: "SKA", country: "TH", name: "Songkhla", nameTh: "สงขลา" },
] as const;
export const RADIUS_OPTIONS_KM = [1, 3, 5, 10] as const;
// น้ำหนักรวมกันต้องเท่ากับ 1 พอดี (ใช้ตรงใน scoring-engine.ts) ห้ามแก้โดยไม่มีเหตุผลบันทึกและ test
// ตาม AI.md — การแก้น้ำหนักคะแนนกระทบผลวิเคราะห์ทุกพื้นที่ในระบบ
export const SCORE_WEIGHTS = {
  demand: 0.2,
  competition: 0.14,
  accessibility: 0.16,
  poi: 0.12,
  infrastructure: 0.14,
  floodRisk: 0.1,
  siteArea: 0.08,
  businessPotential: 0.06,
} as const;
// ต้องเรียงจาก min มากไปน้อยเสมอ เพราะ recommendation-engine.ts หาช่วงคะแนนจากตัวแรกที่ตรงเงื่อนไข
export const SCORE_THRESHOLDS = [
  { min: 90, label: "EXCELLENT" },
  { min: 75, label: "HIGH_POTENTIAL" },
  { min: 60, label: "POTENTIAL" },
  { min: 40, label: "LOW_POTENTIAL" },
  { min: 0, label: "NOT_RECOMMENDED" },
] as const;
// ต้องเรียงจาก minAreaSqm น้อยไปมาก — recommendation-engine.ts อ้างอิงตำแหน่ง [1]/[2] ตรงๆ
// (EV_HUB/FULL_EV_STATION) เพื่อเลือกรูปแบบสถานีจากพื้นที่ที่มี
export const STATION_CONFIGURATIONS: StationConfiguration[] = [
  {
    type: "CHARGING_POINT",
    label: "Charging Point",
    minAreaSqm: 80,
    recommendedAreaSqm: 150,
    chargerRange: [2, 4],
    parkingRange: [2, 5],
    description: "Compact installation for convenient destination charging.",
  },
  {
    type: "EV_HUB",
    label: "EV Hub",
    minAreaSqm: 350,
    recommendedAreaSqm: 500,
    chargerRange: [6, 14],
    parkingRange: [8, 20],
    description: "Multi-charger hub for high-traffic commercial locations.",
  },
  {
    type: "FULL_EV_STATION",
    label: "Full EV Station",
    minAreaSqm: 900,
    recommendedAreaSqm: 1400,
    chargerRange: [12, 30],
    parkingRange: [18, 50],
    description: "Full-service charging destination with supporting facilities.",
  },
];
// ลำดับขั้นตอนของโอกาสทางธุรกิจ เรียงจากเริ่มต้นไปจนติดตั้งเสร็จ ใช้ขับเคลื่อน UI ขั้นตอน/สถานะ
export const OPPORTUNITY_LIFECYCLE = [
  "LEAD",
  "SUBMITTED",
  "UNDER_ANALYSIS",
  "QUALIFIED",
  "SITE_SURVEY",
  "APPROVED",
  "CONTRACT",
  "CONSTRUCTION",
  "INSTALLED",
  "OPERATIONAL",
] as const;

import { SCORE_THRESHOLDS, STATION_CONFIGURATIONS } from "@/src/config/business";
import type { Recommendation, Site, SiteScore, StationType } from "@/src/domain/models";
export function recommendSite(site: Site, score: SiteScore): Recommendation {
  // SCORE_THRESHOLDS เรียงจาก min มากไปน้อย ตัวแรกที่ตรงเงื่อนไขคือช่วงคะแนนที่ถูกต้อง
  const threshold = SCORE_THRESHOLDS.find((x) => score.overall >= x.min)!;
  // น้ำท่วมสูงถือเป็นความเสี่ยงร้ายแรง ตามกฎธุรกิจใน AI.md ต้อง override ช่วงคะแนนทั้งหมด
  // ไม่ใช่แค่ลดคะแนน เพื่อไม่ให้พื้นที่เสี่ยงน้ำท่วมดูน่าแนะนำทั้งที่ยังไม่ได้สำรวจ
  const highFlood = site.floodRisk === "HIGH";
  const missingPower =
    !site.powerAvailability ||
    site.powerAvailability === "Unknown" ||
    site.powerAvailability.includes("Requires");
  // เลือกรูปแบบสถานีจากพื้นที่เพียงอย่างเดียว STATION_CONFIGURATIONS[1]/[2] คือ EV_HUB/FULL_EV_STATION
  // เรียงจาก minAreaSqm น้อยไปมาก จึงต้องเช็คระดับใหญ่สุดก่อน
  let stationType: StationType = "CHARGING_POINT";
  if ((site.areaSqm ?? 0) >= STATION_CONFIGURATIONS[2].minAreaSqm) stationType = "FULL_EV_STATION";
  else if ((site.areaSqm ?? 0) >= STATION_CONFIGURATIONS[1].minAreaSqm) stationType = "EV_HUB";
  return {
    // overridden สอดคล้องกับ highFlood ด้านล่าง: label/stationType จงใจไม่ใช้คะแนน/สถานีที่คำนวณได้
    // เมื่อความเสี่ยงน้ำท่วมอยู่ในระดับร้ายแรง
    label: highFlood ? "REQUIRES_INVESTIGATION" : threshold.label,
    stationType: highFlood ? "REQUIRES_SITE_SURVEY" : stationType,
    reasons: [
      score.factors.demand >= 80 ? "High estimated EV demand" : "Established local demand",
      score.factors.accessibility >= 85
        ? "Strong road accessibility"
        : "Accessible destination location",
      score.factors.competition >= 80
        ? "Low competitor pressure"
        : "Competitive market with differentiation opportunity",
      (site.areaSqm ?? 0) >= 500
        ? "Area supports multiple charging bays"
        : "Compact footprint suits destination charging",
    ],
    risks: [
      ...(highFlood
        ? ["High flood exposure requires engineering assessment"]
        : site.floodRisk === "MEDIUM"
          ? ["Moderate flood risk should be verified"]
          : []),
      ...(missingPower ? ["Electrical capacity requires site verification"] : []),
      ...(!site.areaVerified ? ["Available area is estimated, not surveyed"] : []),
    ],
    missingInformation: [
      ...(site.transformerDistanceMeters == null
        ? ["Exact transformer capacity and connection distance"]
        : []),
      "Site ownership and commercial terms",
    ],
    overridden: highFlood,
  };
}

import { SCORE_WEIGHTS } from "@/src/config/business";
import type { ScoreFactors, SiteScore } from "@/src/domain/models";
export function calculateSiteScore(factors: ScoreFactors): SiteScore {
  // แต่ละปัจจัย (0-100) คูณสัดส่วนน้ำหนักใน SCORE_WEIGHTS น้ำหนักรวมกันได้ 1 ผลลัพธ์จึงอยู่ในช่วง 0-100
  // floodRisk ที่นี่เป็นคะแนนความปลอดภัย (ยิ่งสูงยิ่งปลอดภัย) ไม่ใช่คะแนนความเสี่ยง — ดู ScoreFactors
  const overall = Math.round(
    Object.entries(SCORE_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + factors[key as keyof ScoreFactors] * weight,
      0,
    ),
  );
  return {
    overall,
    factors,
    calculatedAt: new Date().toISOString(),
    // เพิ่มเลขเวอร์ชันนี้เมื่อแก้ SCORE_WEIGHTS/SCORE_THRESHOLDS เพื่อให้ตรวจย้อนได้ว่าคะแนนที่บันทึก/เปรียบเทียบ
    // มาจากกฎชุดไหน (ตาม AI.md: แก้คะแนน/เกณฑ์ต้องเพิ่มเวอร์ชัน)
    configurationVersion: "demo-v1.0",
  };
}

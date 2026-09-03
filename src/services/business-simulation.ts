import type { StationType } from "@/src/domain/models";
// ตัวเลขฐาน (บาท) ต่อรูปแบบสถานี เป็นค่าสมมติเพื่อสาธิตเท่านั้น (ดู docs/BUSINESS-ASSUMPTIONS.md)
// ห้ามนำเสนอเป็น ROI ที่รับประกัน — UI ต้องระบุว่าเป็น Simulation/Estimate เสมอ
const assumptions = {
  CHARGING_POINT: { investment: 850000, revenue: 65000, operating: 22000 },
  EV_HUB: { investment: 4200000, revenue: 310000, operating: 102000 },
  FULL_EV_STATION: { investment: 11500000, revenue: 790000, operating: 285000 },
} as const;
export function simulateBusiness(type: StationType, demandScore: number) {
  // REQUIRES_SITE_SURVEY / NOT_RECOMMENDED ไม่ใช่รูปแบบสถานีจริง จึงไม่มีค่าฐานให้ใช้
  if (!(type in assumptions)) return null;
  const base = assumptions[type as keyof typeof assumptions];
  // ปรับรายได้ฐานตามคะแนนดีมานด์: ดีมานด์ 0 -> คูณ 0.65, ดีมานด์ 100 -> คูณ 1.05
  const factor = 0.65 + demandScore / 250;
  const monthlyRevenue = Math.round(base.revenue * factor);
  const monthlyOperatingCost = base.operating;
  // กันไว้ที่ 1 บาทเป็นอย่างน้อย เพื่อไม่ให้ ROI/payback ด้านล่างหารด้วยศูนย์แม้กรณีขาดทุน
  const monthlyCash = Math.max(1, monthlyRevenue - monthlyOperatingCost);
  return {
    investment: base.investment,
    monthlyRevenue,
    monthlyOperatingCost,
    annualRoiPercent: +(((monthlyCash * 12) / base.investment) * 100).toFixed(1),
    paybackYears: +(base.investment / (monthlyCash * 12)).toFixed(1),
  };
}

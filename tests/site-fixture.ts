import type { Site } from "@/src/domain/models";

export function siteFixture(patch: Partial<Site> = {}): Site {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: "test-site", name: "Test Site", nameTh: "พื้นที่ทดสอบ", address: "Bangkok", addressTh: "กรุงเทพมหานคร",
    province: "Bangkok", provinceTh: "กรุงเทพมหานคร", district: "Bang Na", districtTh: "บางนา",
    latitude: 13.6681, longitude: 100.6357, areaSqm: 600, areaVerified: false, siteType: "COMMERCIAL",
    businessModel: "PARTNER_HOST", trafficLevel: "HIGH", floodRisk: "LOW", competitorsNearby: 1,
    nearestCompetitorKm: 2, competitorBrands: [], poiCounts: {}, opportunityStatus: "UNDER_ANALYSIS",
    factors: { demand: 85, competition: 75, accessibility: 85, poi: 80, infrastructure: 50, floodRisk: 80, siteArea: 85, businessPotential: 80 },
    provenance: { source: "Unit-test fixture", collectedAt: now, lastUpdated: now, confidence: "MEDIUM", verifiedStatus: "ESTIMATED" },
    ...patch,
  };
}

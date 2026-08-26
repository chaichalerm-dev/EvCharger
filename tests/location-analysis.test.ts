import { describe, expect, it } from "vitest";
import { analyzeLocation, distanceKm } from "@/src/services/location-analysis.service";

describe("location analysis", () => {
  it("calculates nearby demo entities for an arbitrary point", () => {
    const result = analyzeLocation({ label: "Selected point", latitude: 13.6681, longitude: 100.6357, radiusKm: 3, areaSqm: 600 });
    expect(result.site.areaSqm).toBe(600);
    expect(result.site.factors.siteArea).toBeGreaterThan(70);
    expect(result.site.provenance.verifiedStatus).toBe("ESTIMATED");
    expect(result.counts.evStations + result.counts.competitors).toBeGreaterThan(0);
  });

  it("uses haversine distance", () => {
    expect(distanceKm({ latitude: 13.6681, longitude: 100.6357 }, { latitude: 13.6681, longitude: 100.6357 })).toBe(0);
  });
});

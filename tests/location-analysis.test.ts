import { describe, expect, it } from "vitest";
import { analyzeRealLocation, distanceKm } from "@/src/services/location-analysis.service";

describe("location analysis", () => {
  it("calculates a site from real-provider shaped context", () => {
    const now = new Date().toISOString();
    const result = analyzeRealLocation({ label: "Selected point", latitude: 13.6681, longitude: 100.6357, radiusKm: 3, areaSqm: 600 }, {
      osmEntities: [{ id: "osm-1", kind: "EV_STATION", name: "OSM charger", address: "Address unavailable", latitude: 13.6682, longitude: 100.6358, provenance: { source: "OpenStreetMap", collectedAt: now, lastUpdated: now, confidence: "MEDIUM", verifiedStatus: "APPROXIMATE" } }],
      weather: null, elevationMeters: 4, hydrology: null,
      population: { totalPopulation: 15000, densityPerKm2: 5300, areaKm2: 3.14, dataYear: 2025, source: "WorldPop" },
      traffic: { currentSpeedKmh: 24, freeFlowSpeedKmh: 40, confidence: 0.9, roadClosure: false },
      fetchedAt: now, errors: [], cached: false
    });
    expect(result.site.areaSqm).toBe(600);
    expect(result.site.factors.siteArea).toBeGreaterThan(70);
    expect(result.site.provenance.verifiedStatus).toBe("ESTIMATED");
    expect(result.counts.evStations).toBe(1);
  });

  it("uses haversine distance", () => {
    expect(distanceKm({ latitude: 13.6681, longitude: 100.6357 }, { latitude: 13.6681, longitude: 100.6357 })).toBe(0);
  });
});

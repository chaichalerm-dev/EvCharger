import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicLocationContext, OverpassPublicProvider } from "@/src/providers/public-location.providers";

afterEach(() => vi.unstubAllGlobals());

describe("public location providers", () => {
  it("falls back to bounded Photon OSM queries when the configured Overpass endpoint is busy", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 504, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: [{ type: "Feature", properties: { osm_type: "N", osm_id: 77, osm_key: "amenity", osm_value: "fuel", name: "Fuel test" }, geometry: { type: "Point", coordinates: [100.64, 13.68] } }] })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    const entities = await new OverpassPublicProvider().nearby({ latitude: 13.68, longitude: 100.64 }, 3);

    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(entities).toHaveLength(1);
    expect(entities[0]).toMatchObject({ kind: "GAS_STATION", name: "Fuel test" });
    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/photon");
  });

  it("combines partial provider success without crashing the map", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ current: { temperature_2m: 31, precipitation: 0, wind_speed_10m: 8, weather_code: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ elevation: [7] }) })
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ task_id: "worldpop-test" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "success", result: { total_population: 15000, population_density: 5300, area_km2: 3.14, data_year: 2025, data_source: "WorldPop Global 2" } }) });
    vi.stubGlobal("fetch", fetchMock);
    const result = await getPublicLocationContext({ latitude: 13.7, longitude: 100.5 }, 1);
    expect(result.weather?.temperatureC).toBe(31);
    expect(result.elevationMeters).toBe(7);
    expect(result.hydrology).toBeNull();
    expect(result.population?.densityPerKm2).toBe(5300);
    expect(result.traffic).toBeNull();
    expect(result.errors).toContain("River-discharge context unavailable");
  });
});

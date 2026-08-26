import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicLocationContext } from "@/src/providers/public-location.providers";

afterEach(() => vi.unstubAllGlobals());

describe("public location providers", () => {
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

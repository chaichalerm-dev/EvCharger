import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicLocationContext } from "@/src/providers/public-location.providers";

afterEach(() => vi.unstubAllGlobals());

describe("public location providers", () => {
  it("combines partial provider success without crashing the map", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ current: { temperature_2m: 31, precipitation: 0, wind_speed_10m: 8, weather_code: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ elevation: [7] }) })
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    const result = await getPublicLocationContext({ latitude: 13.7, longitude: 100.5 }, 1);
    expect(result.weather?.temperatureC).toBe(31);
    expect(result.elevationMeters).toBe(7);
    expect(result.hydrology).toBeNull();
    expect(result.errors).toContain("River-discharge context unavailable");
  });
});

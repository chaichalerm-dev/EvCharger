import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiBuildingFootprintProvider, OverpassBuildingFootprintProvider } from "@/src/providers/osm-building.provider";

afterEach(() => vi.unstubAllGlobals());

describe("OverpassBuildingFootprintProvider", () => {
  it("converts bounded OSM ways into 3D footprints and highlights the selected building", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ elements: [
        {
          type: "way",
          id: 101,
          tags: { building: "commercial", "building:levels": "4", name: "Selected building" },
          geometry: [
            { lat: 13.6679, lon: 100.6355 }, { lat: 13.6679, lon: 100.6359 },
            { lat: 13.6683, lon: 100.6359 }, { lat: 13.6683, lon: 100.6355 },
            { lat: 13.6679, lon: 100.6355 },
          ],
        },
        {
          type: "way",
          id: 102,
          tags: { building: "yes", height: "18" },
          geometry: [
            { lat: 13.669, lon: 100.637 }, { lat: 13.669, lon: 100.6372 },
            { lat: 13.6692, lon: 100.6372 }, { lat: 13.6692, lon: 100.637 },
          ],
        },
      ] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OverpassBuildingFootprintProvider().nearby({ latitude: 13.6681, longitude: 100.6357 });

    expect(result.features).toHaveLength(2);
    expect(result.features[0].properties).toMatchObject({ heightMeters: 12.4, heightSource: "OSM_LEVELS_ESTIMATE", selected: true });
    expect(result.features[1].properties).toMatchObject({ heightMeters: 18, heightSource: "OSM_HEIGHT" });
    expect(result.features[1].geometry.coordinates[0][0]).toEqual(result.features[1].geometry.coordinates[0].at(-1));
    const requestBody = String(fetchMock.mock.calls[0][1]?.body);
    expect(requestBody).toContain("building");
    expect(requestBody).toContain("geom");
    expect(requestBody).toContain("450");
  });

  it("uses Photon building extents when Overpass has no footprint geometry", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: [{
          properties: { osm_id: 501, name: "Photon building", extent: [100.6398, 13.6812, 100.6402, 13.6808] },
          geometry: { type: "Point", coordinates: [100.64, 13.681] },
        }] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OverpassBuildingFootprintProvider().nearby({ latitude: 13.681, longitude: 100.64 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("osm_tag=building");
    expect(result.features[0].properties).toMatchObject({ geometrySource: "PHOTON_EXTENT", heightSource: "DEFAULT_ESTIMATE", selected: true });
    expect(result.features[0].geometry.coordinates[0][0]).toEqual([100.6398, 13.6808]);
  });
});

describe("ApiBuildingFootprintProvider", () => {
  it("loads browser fallback geometry through the same-origin application API", async () => {
    const collection = { type: "FeatureCollection", features: [] } as const;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => collection });
    vi.stubGlobal("fetch", fetchMock);

    await expect(new ApiBuildingFootprintProvider().nearby({ latitude: 13.6681, longitude: 100.6357 }))
      .resolves.toEqual(collection);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/map/buildings?latitude=13.668100&longitude=100.635700");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/photon/route";

afterEach(() => vi.unstubAllGlobals());

describe("restricted Photon proxy", () => {
  it("rejects coordinates outside configured Thailand coverage", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/photon?lon=0&lat=0&radius=3&osm_tag=amenity"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards only a validated bounded query to the fixed Photon endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ type: "FeatureCollection", features: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/photon?lon=100.6357&lat=13.6681&radius=3&osm_tag=amenity%3Afuel"));
    const upstreamUrl = String(fetchMock.mock.calls[0][0]);

    expect(response.status).toBe(200);
    expect(upstreamUrl).toContain("https://photon.komoot.io/reverse");
    expect(upstreamUrl).toContain("osm_tag=amenity%3Afuel");
    expect(upstreamUrl).not.toContain("localhost");
  });
});

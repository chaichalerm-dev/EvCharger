import { describe, expect, it, vi } from "vitest";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  shouldRecenterForSelection,
  syncMapSelectionSources,
} from "@/src/features/map/map-selection";

describe("map selection camera behavior", () => {
  it("keeps the viewport stable when a user drops a pin directly on the map", () => {
    expect(shouldRecenterForSelection("MAP")).toBe(false);
  });

  it("moves the camera when a search result can be outside the viewport", () => {
    expect(shouldRecenterForSelection("SEARCH")).toBe(true);
  });

  it("updates marker and radius sources without waiting for raster tiles", () => {
    const radiusSetData = vi.fn();
    const pointSetData = vi.fn();
    const map = {
      getSource: vi.fn((id: string) => id === "analysis-radius"
        ? { setData: radiusSetData }
        : id === "selected-point"
          ? { setData: pointSetData }
          : undefined),
      isStyleLoaded: vi.fn(() => false),
    } as unknown as Pick<MapLibreMap, "getSource">;

    const result = syncMapSelectionSources(map, { latitude: 13.7, longitude: 100.61 }, 5);

    expect(result).toEqual({ radiusUpdated: true, pointUpdated: true });
    expect(radiusSetData).toHaveBeenCalledOnce();
    expect(pointSetData).toHaveBeenCalledWith(expect.objectContaining({
      geometry: expect.objectContaining({ coordinates: [100.61, 13.7] }),
    }));
  });
});

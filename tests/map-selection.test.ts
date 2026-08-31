import { describe, expect, it } from "vitest";
import {
  circlePolygon,
  shouldRecenterForSelection,
} from "@/src/features/map/map-selection";

describe("map selection camera behavior", () => {
  it("keeps the viewport stable when a user drops a pin directly on the map", () => {
    expect(shouldRecenterForSelection("MAP")).toBe(false);
  });

  it("moves the camera when a search result can be outside the viewport", () => {
    expect(shouldRecenterForSelection("SEARCH")).toBe(true);
  });

  it("creates a closed geodesic radius polygon", () => {
    const coordinates = circlePolygon(100.61, 13.7, 5).geometry.coordinates[0];

    expect(coordinates).toHaveLength(65);
    expect(coordinates[0]).toEqual(coordinates.at(-1));
    expect(Math.max(...coordinates.map(([longitude]) => longitude))).toBeGreaterThan(100.61);
    expect(Math.min(...coordinates.map(([longitude]) => longitude))).toBeLessThan(100.61);
  });
});

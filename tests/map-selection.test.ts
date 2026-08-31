import { describe, expect, it } from "vitest";
import { shouldRecenterForSelection } from "@/src/features/map/map-selection";

describe("map selection camera behavior", () => {
  it("keeps the viewport stable when a user drops a pin directly on the map", () => {
    expect(shouldRecenterForSelection("MAP")).toBe(false);
  });

  it("moves the camera when a search result can be outside the viewport", () => {
    expect(shouldRecenterForSelection("SEARCH")).toBe(true);
  });
});

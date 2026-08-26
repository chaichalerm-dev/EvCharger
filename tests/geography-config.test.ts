import { describe, expect, it } from "vitest";
import { MAP_MARKER_STYLE, THAILAND_MAP_VIEW } from "@/src/config/geography";

describe("Thailand prototype map configuration", () => {
  it("uses a Thailand-only navigation envelope without world copies", () => {
    expect(THAILAND_MAP_VIEW.countryCode).toBe("TH");
    expect(THAILAND_MAP_VIEW.bounds).toEqual([[97, 5], [106, 21]]);
    expect(THAILAND_MAP_VIEW.renderWorldCopies).toBe(false);
    expect(THAILAND_MAP_VIEW.minZoom).toBeGreaterThanOrEqual(5);
  });

  it("keeps map markers compact and viewport-scaled", () => {
    expect(MAP_MARKER_STYLE.pitchAlignment).toBe("viewport");
    expect(MAP_MARKER_STYLE.pitchScale).toBe("viewport");
    expect(MAP_MARKER_STYLE.opportunityClusterRadius).toBeLessThanOrEqual(12);
    expect(MAP_MARKER_STYLE.entityPointRadius).toBeLessThan(MAP_MARKER_STYLE.opportunityPointRadius);
  });
});

import { describe, expect, it } from "vitest";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { recommendSite } from "@/src/services/recommendation-engine";
import { siteFixture } from "./site-fixture";

describe("recommendation engine", () => {
  it("overrides a strong score when flood risk is high", () => {
    const site = siteFixture({ floodRisk: "HIGH" });
    const result = recommendSite(site, calculateSiteScore(site.factors));
    expect(result.label).toBe("REQUIRES_INVESTIGATION");
    expect(result.stationType).toBe("REQUIRES_SITE_SURVEY");
    expect(result.overridden).toBe(true);
  });

  it("never treats an estimated area as verified", () => {
    const site = siteFixture({ areaVerified: false });
    const result = recommendSite(site, calculateSiteScore(site.factors));
    expect(result.risks).toContain("Available area is estimated, not surveyed");
  });
});

import { describe, expect, it } from "vitest";
import { filterSites } from "@/src/services/site-search";
import { siteFixture } from "./site-fixture";

const sites = [
  siteFixture({ id: "bang-na", name: "Bang Na", nameTh: "บางนา", province: "Bangkok", opportunityStatus: "APPROVED" }),
  siteFixture({ id: "phuket", name: "Phuket Central", nameTh: "ภูเก็ต", province: "Phuket", district: "Mueang" }),
];

describe("site search", () => {
  it("searches Thai and English geographic fields", () => {
    expect(filterSites(sites, { query: "บางนา" }).map(site => site.id)).toContain("bang-na");
    expect(filterSites(sites, { query: "Phuket" })).toHaveLength(1);
  });
  it("combines province and lifecycle filters", () => expect(filterSites(sites, { province: "Bangkok", status: "APPROVED" })).toHaveLength(1));
  it("returns an empty state for unmatched queries", () => expect(filterSites(sites, { query: "no such place" })).toEqual([]));
});

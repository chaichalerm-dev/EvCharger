import { repositories } from "@/src/repositories";
import { calculateSiteScore } from "./scoring-engine";
import { recommendSite } from "./recommendation-engine";
export const siteService = {
  list: () => repositories.sites.getSites(),
  async getIntelligence(id: string) {
    const site = await repositories.sites.getSiteById(id);
    if (!site) return null;
    const score = calculateSiteScore(site.factors);
    return { site, score, recommendation: recommendSite(site, score) };
  },
};

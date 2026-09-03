import type { Site } from "@/src/domain/models";
import type { SiteRepository } from "./site.repository";

/** ป้องกันไม่ให้ข้อมูลจำลอง (demo fixture) หลุดเข้าไปใน Real Provider Mode */
export class EmptySiteRepository implements SiteRepository {
  async getSites(): Promise<Site[]> { return []; }
  async getSiteById(): Promise<Site | null> { return null; }
  async createSite(input: Site): Promise<Site> { return input; }
  async updateSite(_id: string, patch: Partial<Site>): Promise<Site> {
    throw new Error(`Business API is not configured. Update rejected: ${Object.keys(patch).join(", ")}`);
  }
  async deleteSite(): Promise<void> { throw new Error("Business API is not configured. Delete rejected."); }
}

import { MockSiteRepository } from "./mock-site.repository"; import type { SiteRepository } from "./site.repository";
export interface Repositories{sites:SiteRepository} export const repositories:Repositories={sites:new MockSiteRepository()};

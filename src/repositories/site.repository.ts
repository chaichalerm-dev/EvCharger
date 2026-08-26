import type { Site } from "@/src/domain/models";
export interface SiteRepository { getSites():Promise<Site[]>; getSiteById(id:string):Promise<Site|null>; createSite(input:Site):Promise<Site>; updateSite(id:string,patch:Partial<Site>):Promise<Site>; deleteSite(id:string):Promise<void>; }

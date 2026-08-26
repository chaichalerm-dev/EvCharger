import type { Site } from "@/src/domain/models";
export interface SiteFilters{query?:string;province?:string;status?:string}
export function filterSites(sites:Site[],filters:SiteFilters){const query=(filters.query??"").trim().toLocaleLowerCase();return sites.filter(site=>(!filters.province||filters.province==="ALL"||site.province===filters.province)&&(!filters.status||filters.status==="ALL"||site.opportunityStatus===filters.status)&&(!query||(site.name+" "+site.nameTh+" "+site.province+" "+site.provinceTh+" "+site.district+" "+site.districtTh).toLocaleLowerCase().includes(query)))}

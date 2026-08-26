import type { Branch,MapEntity,Partner,Site } from "@/src/domain/models";
export interface CatalogRepository{getSites():Site[];getMapEntities():MapEntity[];getPartners():Partner[];getBranches():Branch[]}

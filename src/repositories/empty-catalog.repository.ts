import type { Branch, MapEntity, Partner, Site } from "@/src/domain/models";
import type { CatalogRepository } from "./catalog.repository";

/** Runtime-safe fallback used until a company Business API is configured. */
export class EmptyCatalogRepository implements CatalogRepository {
  getSites(): Site[] { return []; }
  getMapEntities(): MapEntity[] { return []; }
  getPartners(): Partner[] { return []; }
  getBranches(): Branch[] { return []; }
}

import type { Branch, MapEntity, Partner, Site } from "@/src/domain/models";
import type { CatalogRepository } from "./catalog.repository";

/** ค่าเริ่มต้นที่ปลอดภัยสำหรับ runtime ใช้จนกว่าจะตั้งค่า Business API ของบริษัท */
export class EmptyCatalogRepository implements CatalogRepository {
  getSites(): Site[] { return []; }
  getMapEntities(): MapEntity[] { return []; }
  getPartners(): Partner[] { return []; }
  getBranches(): Branch[] { return []; }
}

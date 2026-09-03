import { EmptyCatalogRepository } from "@/src/repositories/empty-catalog.repository";
// หมายเหตุ: ปัจจุบันไม่มีที่ใดใน src/app import catalogService นี้เลย (ตรวจสอบด้วย grep แล้ว)
// ต่อกับ EmptyCatalogRepository ไว้เป็น placeholder รอเชื่อม Business API จริงในอนาคต
const repository = new EmptyCatalogRepository();
export const catalogService = {
  getSites: () => repository.getSites(),
  getMapEntities: () => repository.getMapEntities(),
  getPartners: () => repository.getPartners(),
  getBranches: () => repository.getBranches(),
};

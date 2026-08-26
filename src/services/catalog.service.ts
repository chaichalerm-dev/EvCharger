import { MockCatalogRepository } from "@/src/repositories/mock-catalog.repository";
const repository=new MockCatalogRepository();
export const catalogService={getSites:()=>repository.getSites(),getMapEntities:()=>repository.getMapEntities(),getPartners:()=>repository.getPartners(),getBranches:()=>repository.getBranches()};

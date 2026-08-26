import { EmptyCatalogRepository } from "@/src/repositories/empty-catalog.repository";
const repository=new EmptyCatalogRepository();
export const catalogService={getSites:()=>repository.getSites(),getMapEntities:()=>repository.getMapEntities(),getPartners:()=>repository.getPartners(),getBranches:()=>repository.getBranches()};

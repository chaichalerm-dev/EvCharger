import { z } from "zod"; import { LocalStorageSubmissionRepository } from "@/src/repositories/local-storage-submission.repository";
export const submissionSchema=z.object({location:z.string().min(2,"Location is required").max(100),address:z.string().min(5,"Address is required").max(300),siteArea:z.coerce.number().min(20).max(100000),businessType:z.string().min(2),parking:z.coerce.number().min(0).max(5000),facilities:z.string().max(500),notes:z.string().max(1000),contact:z.string().min(2).max(100)});
export const submissionService=new LocalStorageSubmissionRepository();

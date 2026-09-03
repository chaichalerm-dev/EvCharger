import { z } from "zod";
import { LocalStorageSubmissionRepository } from "@/src/repositories/local-storage-submission.repository";
// ขอบเขตตัวเลขกันค่าที่ไม่สมเหตุสมผล (พื้นที่/ที่จอดรถติดลบหรือใหญ่เกินจริง) ไม่ใช่กฎธุรกิจตายตัว
export const submissionSchema = z.object({
  location: z.string().min(2, "Location is required").max(100),
  address: z.string().min(5, "Address is required").max(300),
  siteArea: z.coerce.number().min(20).max(100000),
  businessType: z.string().min(2),
  parking: z.coerce.number().min(0).max(5000),
  facilities: z.string().max(500),
  notes: z.string().max(1000),
  contact: z.string().min(2).max(100),
});
// เก็บใน localStorage ของเครื่อง/เบราว์เซอร์นั้นเท่านั้น ไม่ sync ข้ามอุปกรณ์และไม่ใช่ cloud database
export const submissionService = new LocalStorageSubmissionRepository();

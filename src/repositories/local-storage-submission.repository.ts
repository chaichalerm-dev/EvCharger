import type { PartnerSubmission, SubmissionRepository } from "./submission.repository";
const KEY = "evatlas.prototype.submissions";
// เก็บข้อมูลเฉพาะระดับต้นแบบ: อยู่ในเครื่อง/browser เท่านั้น ไม่เข้ารหัส ไม่ multi-user ไม่ sync
// ก่อนใช้งานจริงต้องเปลี่ยนเป็น repository ที่เชื่อม backend จริง (ดู LIMITATIONS.md)
export class LocalStorageSubmissionRepository implements SubmissionRepository {
  async list() {
    // Next.js อาจ render ฝั่ง server ซึ่งไม่มี localStorage ให้ใช้
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]") as PartnerSubmission[];
    } catch {
      return [];
    }
  }
  async create(input: Omit<PartnerSubmission, "id" | "createdAt" | "status">) {
    const item: PartnerSubmission = {
      ...input,
      id: `local-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      status: "SUBMITTED",
    };
    const all = await this.list();
    localStorage.setItem(KEY, JSON.stringify([item, ...all]));
    return item;
  }
  async remove(id: string) {
    const all = await this.list();
    localStorage.setItem(KEY, JSON.stringify(all.filter((x) => x.id !== id)));
  }
}

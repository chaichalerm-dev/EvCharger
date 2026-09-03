import { EmptySiteRepository } from "./empty-site.repository"; import type { SiteRepository } from "./site.repository";
// จุดเดียวที่ประกอบ site repository เข้าด้วยกัน เมื่อมี implementation ที่เชื่อม Business API จริง
// ให้สลับ EmptySiteRepository ที่นี่ — ฝั่ง feature พึ่งพา SiteRepository ไม่ใช่ไฟล์นี้โดยตรง
export interface Repositories{sites:SiteRepository} export const repositories:Repositories={sites:new EmptySiteRepository()};

# Handoff / คู่มือส่งมอบ

## ภาษาไทย

### Demo script ที่แนะนำ

1. เปิดหน้าแรกและอธิบายคำถาม “ควรขยายสถานี EV ที่ไหน และเพราะอะไร”
2. เข้า Map Explorer ค้นหาบางนา/พื้นที่จริงที่สนใจ หรือคลิกจุด
3. เลือกรัศมีและระบุพื้นที่ว่าง จากนั้นกดวิเคราะห์
4. เปิด/ปิด layer และสาธิต legend แบบพับได้
5. เปิด 3D อธิบาย terrain ทั่วพื้นที่กับข้อจำกัดอาคาร OSM
6. อ่าน overall score, factor bars, recommendation, reasons, risks และ missing information
7. ชี้ให้เห็น Estimated/Approximate และ Requires Site Survey
8. เปิด Compare/Expansion เพื่ออธิบายหน้าที่จะใช้เมื่อเชื่อม Company API
9. สาธิต partner submission พร้อมคำเตือน local storage
10. เปิด Settings แสดง provider connection และอธิบายว่า token หายเมื่อ refresh

### สิ่งที่เจ้าของผลิตภัณฑ์ต้องตัดสินใจ

- อนุมัติน้ำหนัก เกณฑ์ critical override และประเภทสถานี
- นิยาม authoritative source และ freshness ของแต่ละ field
- เลือก Company API/backend/auth/database/provider contract
- กำหนด tenant, role, approval และ audit workflow
- อนุมัติ CAPEX/OPEX/tariff/utilization/financial model
- กำหนด PDPA, licensing, retention, backup และ incident requirements

### Checklist ก่อน production

- สำรวจ electrical, flood, access, ownership และ commercial evidence
- Backend authorization และ audit ผ่าน security review
- PostGIS query/index ผ่าน performance test
- Provider license/quota/SLA และ attribution ได้รับอนุมัติ
- Private upload และ malware scanning พร้อมใช้งาน
- Backup restore และ rollback ทดสอบแล้ว
- Monitoring, alert, runbook และ owner พร้อม
- Thai/English translation และ accessibility audit ผ่าน

### ผู้รับผิดชอบที่ควรมี

Product/business owner, GIS/data owner, electrical engineer, backend/platform owner, security/privacy owner, finance owner, legal/procurement และ operations/site survey owner

ต้นแบบนี้ส่งมอบเป็นเครื่องมือสาธิตและฐานสถาปัตยกรรม ไม่ใช่ระบบอนุมัติลงทุนขั้นสุดท้าย

---

## English

### Recommended demo

Start with the business question, open the map, select a real area, set radius/area, Analyze, demonstrate layers and compact legend, explain terrain versus building coverage, interpret score/reasons/risks/gaps, show data quality, describe company-connected views, submit a local partner site, and show replaceable provider settings with refresh-cleared tokens.

### Product-owner decisions

Approve scoring and station rules, authoritative sources and freshness, backend/auth/database/provider strategy, tenant and workflow policy, financial assumptions, and PDPA/licensing/retention/backup/incident requirements.

### Production checklist and ownership

Verify engineering and commercial evidence; review backend security/audit; performance-test PostGIS; approve provider terms; implement private scanned uploads; test restore and rollback; establish monitoring/runbooks; and complete bilingual/accessibility review. Assign product, GIS/data, electrical, platform, security/privacy, finance, legal/procurement, and operations owners.

This handoff is a demonstrable prototype and architectural foundation, not a final investment-approval system.

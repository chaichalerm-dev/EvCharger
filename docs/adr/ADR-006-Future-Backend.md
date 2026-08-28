# ADR-006: Future Backend Boundary / ขอบเขต Backend ในอนาคต

- **Status / สถานะ:** Deferred with accepted boundary / เลื่อน implementation แต่ยอมรับขอบเขต
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

ต้นแบบไม่ควรต้องรัน server แยก แต่ production ต้องมี secure identity, shared persistence, provider secret, audit, workflow, file storage และ GIS processing

### การตัดสินใจ

กำหนด REST boundary ระหว่าง Next.js กับ backend และให้ repository/provider adapter ใน frontend map response เป็น domain contract Backend อาจใช้ NestJS/Node.js หรือ Go โดย choice ไม่รั่วเข้า feature component

### Trigger สำหรับเริ่ม backend

- ผู้ใช้/tenant มากกว่าหนึ่งและต้องแชร์ข้อมูล
- ต้อง enforce permission, approval และ audit
- ต้องเก็บ secret หรือ proxy provider
- มี upload/document จริง
- ต้อง sync data ตามเวลา หรือทำ job นาน
- ต้องใช้ PostGIS และ authoritative calculation

### ผลกระทบ

Frontend เริ่มใช้งานได้ก่อน แต่ contract governance สำคัญมาก ต้องมี OpenAPI/schema, versioning, idempotency, pagination, errors, observability และ migration plan Service split, Redis และ queue ไม่ถูกเพิ่มจนมี need

## English

### Context and decision

The prototype should not require a separate server, while production needs identity, shared persistence, secrets, audit, workflow, storage, and GIS. Define a REST boundary and map backend DTOs through frontend adapters into stable domain contracts. NestJS/Node.js or Go may implement the backend without leaking into feature components.

### Triggers and consequences

Start backend work for shared multi-user data, enforced permissions/audit, confidential provider credentials, durable uploads, scheduled/long jobs, or PostGIS authority. The deferred implementation still requires disciplined OpenAPI/schema versioning, idempotency, pagination, errors, observability, and migration. Redis, queues, or service splits remain demand-driven.

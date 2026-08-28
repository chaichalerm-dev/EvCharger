# Future Backend / Backend ในอนาคต

## ภาษาไทย

### สถานะและเหตุผล

ต้นแบบปัจจุบันไม่ต้องมี backend สำหรับ public location analysis การเพิ่ม backend ควรเกิดเมื่อระบบต้องมี multi-user persistence, production authentication/authorization, audit, private upload, provider synchronization, server-side secret, job queue หรือ PostGIS

### เส้นทางการย้าย

```text
ปัจจุบัน
Next.js → Services/Hooks → Public Providers
        → Optional Company Business API
        → LocalStorage เฉพาะ prototype submission

ระยะเปลี่ยนผ่าน
Next.js → Typed API Repository → REST API/BFF
        → Existing domain contracts

อนาคต
Next.js → REST API → NestJS/Node.js หรือ Go
        → PostgreSQL + PostGIS
        → Redis / Queue / Workers / Object Storage
```

### Module ที่แนะนำ

- Identity: user, session, role, permission
- Partner and branch management
- Site and opportunity lifecycle
- Analysis orchestration and score versions
- GIS query and provider ingestion
- Documents/photos with private storage
- Notification and workflow
- Audit, reporting, health, and administration

### API contract

ใช้ versioned REST เช่น `/api/v1` มี OpenAPI, DTO schema, pagination, sorting, filtering, idempotency key สำหรับ command สำคัญ, request ID, standardized error และ optimistic concurrency (`version` หรือ ETag) การ analyze ควรคืน job ID เมื่อใช้เวลานาน

### Security boundary

Backend ตรวจ authentication และ authorization ทุก request แม้ frontend ซ่อนปุ่มแล้ว Provider secret อยู่ใน secret manager และ endpoint proxy ต้องมี allow-list ป้องกัน SSRF Upload ผ่าน signed URL ไป private bucket พร้อม content validation, malware scan และ retention policy

### Provider synchronization

Scheduled sync ใช้ job queue, distributed lock, retry/backoff, dead-letter handling, cursor/checkpoint, idempotent upsert และ raw snapshot ทุก run มี provider/version/time/status/metrics ห้ามให้ sync failure ลบ current good snapshot โดยอัตโนมัติ

### Observability และ scale

เริ่มจาก structured log, metrics, traces, request/job ID, error budget และ provider health จากนั้นเพิ่ม Redis, CDN, worker concurrency, connection pooling, query optimization, read replica หรือ service separation เมื่อมีตัวชี้วัดรองรับ เป้าหมาย 10 → 100 → 1,000 → 10,000+ users ไม่ได้หมายความว่าต้องเพิ่ม infrastructure ทั้งหมดตั้งแต่วันแรก

### Migration checklist

1. Freeze/domain-version current contracts
2. สร้าง OpenAPI และ Zod DTO mapping
3. Implement API repositories หลัง interface เดิม
4. เพิ่ม auth, RBAC และ audit
5. ย้าย local submissions แบบมี consent/migration plan
6. เปรียบเทียบ score parity ระหว่าง client/server
7. เปิด feature flag ต่อ resource
8. Monitor และมี rollback ก่อนเลิกใช้ adapter เดิม

---

## English

### Status and rationale

Public location analysis currently requires no backend. Introduce one when the product needs multi-user persistence, production identity and authorization, audit, private uploads, provider synchronization, server secrets, queues, or PostGIS.

### Migration path

The diagram above moves from Next.js services/providers to typed API repositories, then to a versioned REST API backed by NestJS/Node.js or Go, PostgreSQL/PostGIS, and only measured supporting infrastructure.

### Suggested modules

Identity, partners/branches, sites/opportunities, analysis/score versions, GIS/provider ingestion, private documents, workflow/notifications, and audit/health/reporting form bounded modules.

### API contract

Use versioned REST with OpenAPI, schema validation, pagination, filtering, idempotency for important commands, request IDs, standardized errors, and optimistic concurrency. Long-running analysis should return a job identifier.

### Security, synchronization, and scale

Authorize every request server-side. Keep provider secrets in a secret manager and allow-list proxy destinations. Use private signed uploads, content validation, scanning, and retention. Synchronization requires idempotency, checkpoints, retry/backoff, dead-letter handling, and raw snapshots. Add caching, replicas, queues, or service separation only from observed demand.

### Migration checklist

Stabilize contracts, publish schemas, implement API adapters behind existing interfaces, add identity/audit, plan local-data migration, verify score parity, roll out per resource, and retain rollback until monitored behavior is stable.

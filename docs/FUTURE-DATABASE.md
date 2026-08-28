# Future Database / ฐานข้อมูลในอนาคต

## ภาษาไทย

### Technology

ใช้ PostgreSQL + PostGIS เป็น system of record Supabase สามารถให้ managed PostgreSQL, Auth และ Storage ได้ แต่ application authorization และ business validation ยังต้องอยู่ใน backend ด้วย ไม่ใช้ browser เชื่อม database โดยตรงสำหรับ privileged workflow

### กลุ่ม entity

| กลุ่ม | Entity ตัวอย่าง |
| --- | --- |
| Identity | User, Role, Permission, UserRole, RolePermission |
| Partner | Partner, PartnerBranch, Contact, Contract |
| Site workflow | Site, SiteBoundary, SiteOpportunity, OpportunityEvent, SiteSurvey |
| Analysis | SiteAnalysis, SiteScore, ScoreFactor, ScoreConfiguration, Recommendation |
| Market GIS | EVStation, EVCharger, Competitor, GasStation, POI, FloodZone |
| Station planning | StationType, StationConfiguration, BusinessScenario, InvestmentEstimate |
| Evidence | Document, SitePhoto, DataSource, DataSnapshot |
| Operations | AuditLog, Notification, JobRun, ProviderHealth |

### Mapping จากต้นแบบ

- `Site` แยกเป็น Site + latest analysis + score + opportunity + provenance reference
- `MapEntity` แยกตามชนิดและ provider identifier
- `DataProvenance` map ไป DataSource/DataSnapshot และ observation quality
- `Partner` และ `Branch` ใช้ foreign key one-to-many
- `OpportunityStatus` เก็บ current status และ append-only event history
- `SiteScore` เก็บ factor snapshot และ score configuration ID เพื่อ reproduce ผล

### Convention

- UUID/ULID สำหรับ public-safe identifier
- `timestamptz` และ UTC ใน database; localize ที่ UI
- จำนวนเงินใช้ integer minor unit หรือ `numeric` พร้อม currency code
- หน่วยต้องอยู่ในชื่อ column เช่น `_sqm`, `_meters`, `_kw`
- Geometry SRID 4326 พร้อม spatial index
- `created_at`, `updated_at`, `created_by`, `version`
- Soft archive เฉพาะ entity ที่ต้องรักษาประวัติ; audit เป็น append-only
- Unique constraint บน `(provider_id, provider_record_id)`

### Integrity และ history

ใช้ foreign key, check constraint, non-negative numeric constraints, valid enum/reference tables และ transaction boundary ที่ชัด การแก้ score configuration สร้าง version ใหม่ ไม่แก้ record เก่า Analysis เก็บ input snapshot เพื่อ reproduce และ compare

### Multi-tenant และ RLS

ถ้ามีหลายบริษัท ให้ทุก business record มี tenant/organization boundary RLS บังคับ isolation เพิ่มเติม แต่ backend ต้องตรวจ role, ownership และ action policy ซ้ำ Service role key ห้ามอยู่ใน browser

### Backup และ lifecycle

กำหนด PITR, encrypted backup, restore drill, retention, archive, deletion workflow และ evidence legal hold ทดสอบ restore จริงตาม RTO/RPO อย่าถือว่า “มี backup” เท่ากับ “กู้คืนได้”

---

## English

### Technology

Use PostgreSQL + PostGIS as the system of record. Supabase may provide managed PostgreSQL, Auth, and Storage, but backend application authorization and validation remain necessary. Privileged workflows must not connect the browser directly to the database.

### Entity groups and prototype mapping

The tables above group identity, partner, site workflow, analysis, market GIS, station planning, evidence, and operations. Prototype Site, MapEntity, provenance, partner/branch, opportunity status, and score snapshots map into normalized entities with reproducible history.

### Conventions

Use safe identifiers, UTC `timestamptz`, explicit money/currency and measurement units, SRID 4326 geometry with indexes, actor/version columns, selective archival, append-only audit, and unique provider identifiers.

### Integrity and history

Enforce foreign keys, checks, non-negative values, valid references, and clear transactions. Score configuration changes create new immutable versions. Analyses retain input snapshots so outputs can be reproduced.

### Multi-tenancy, backup, and lifecycle

Every business record carries an organization boundary when multi-tenant. RLS adds defense in depth but never replaces backend policy. Keep service keys out of browsers. Define point-in-time recovery, encrypted backup, restore drills, retention, deletion, legal hold, RTO, and RPO; prove recovery through testing.

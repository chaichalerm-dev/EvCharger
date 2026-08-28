# Data Model / แบบจำลองข้อมูล

## ภาษาไทย

### หลักการ

Domain model แยกจาก UI, transport DTO และ persistence entity เพื่อให้เปลี่ยนจาก local/remote adapter ไปสู่ backend และ PostGIS ได้โดยไม่กระทบ component ข้อมูลพิกัดใช้ WGS84 และทุกหน่วยต้องระบุชัด

### โมเดลหลัก

| โมเดล | หน้าที่ |
| --- | --- |
| `Site` | ทำเลผู้สมัคร พิกัด ที่อยู่ พื้นที่ ความเสี่ยง ปัจจัย และสถานะโอกาส |
| `MapEntity` | EV station, competitor, gas station, POI หรือ partner branch บนแผนที่ |
| `SiteScore` | overall, factor snapshot, เวลา และ configuration version |
| `Recommendation` | label, station type, reasons, risks, gaps และ override flag |
| `StationConfiguration` | พื้นที่ charger/parking range และคำอธิบายประเภทสถานี |
| `Partner` | ประเภทพันธมิตร สถานะ สัญญา และจำนวนสาขา |
| `Branch` | สาขาที่ประเมินแยก พร้อมพื้นที่ ไฟฟ้า score และ installation status |
| `OpportunityStatus` | lifecycle ตั้งแต่ lead ถึง operational |

### Data provenance

ข้อมูลสำคัญใช้ `DataProvenance`:

- `source`: ชื่อแหล่งข้อมูล
- `sourceUrl`: URL เมื่อเปิดเผยได้และปลอดภัย
- `collectedAt`: เวลาที่เก็บ observation
- `lastUpdated`: เวลาที่ source/record อัปเดตล่าสุด
- `confidence`: HIGH, MEDIUM หรือ LOW
- `verifiedStatus`: VERIFIED, ESTIMATED, APPROXIMATE, UNVERIFIED หรือ EXPIRED

Area มี `areaVerified` แยกต่างหากเพื่อป้องกัน estimated area ถูกนำเสนอเป็น verified

### Enumerations สำคัญ

- Flood: LOW, MEDIUM, HIGH
- Station: CHARGING_POINT, EV_HUB, FULL_EV_STATION, REQUIRES_SITE_SURVEY, NOT_RECOMMENDED
- Business model: COMPANY_OWNED, FRANCHISE, PARTNER_HOST, BRANCH_EXPANSION
- Lifecycle: LEAD, SUBMITTED, UNDER_ANALYSIS, QUALIFIED, SITE_SURVEY, APPROVED, REJECTED, CONTRACT, CONSTRUCTION, INSTALLED, OPERATIONAL

### กฎ transport และ persistence

API adapter ต้อง parse/validate DTO แล้ว map เป็น domain model UI ไม่ควรรับ snake_case, nullable semantics หรือ provider-specific code โดยตรง Database entity ในอนาคตควรแยก observation history จาก current snapshot และเก็บ configuration version ที่ใช้คำนวณทุก score

---

## English

### Principles

Domain models remain separate from UI, transport DTOs, and persistence entities. This allows local/remote adapters to move to a backend and PostGIS without rewriting components. Coordinates use WGS84 and units remain explicit.

### Core models

The table above describes `Site`, `MapEntity`, `SiteScore`, `Recommendation`, `StationConfiguration`, `Partner`, `Branch`, and `OpportunityStatus`.

### Data provenance

Important observations use `DataProvenance` with source, optional safe source URL, collection time, last update, confidence, and verification status. `areaVerified` is independent so estimated area cannot be presented as verified.

### Important enumerations

Flood, station type, business model, and lifecycle values are listed above and form stable domain vocabulary. API versions should evolve them deliberately rather than accepting arbitrary strings.

### Transport and persistence rules

API adapters parse and validate DTOs before mapping to domain models. UI must not depend directly on snake_case, provider-specific codes, or transport nullability. Future database models separate observation history from current snapshots and retain the score-configuration version for every calculation.

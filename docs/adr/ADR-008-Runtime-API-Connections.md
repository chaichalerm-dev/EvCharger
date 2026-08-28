# ADR-008: Runtime API Connections / การตั้งค่าการเชื่อมต่อ API ระหว่างใช้งาน

- **Status / สถานะ:** Accepted / ยอมรับแล้ว
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

ผู้ใช้ต้องการเชื่อม API จริงแบบฟรี/มี quota และเปลี่ยน key ได้จากหน้าใช้งานโดยไม่แก้โค้ด แต่การเก็บ secret ใน localStorage หรือ bundle จะสร้างความเข้าใจผิดด้านความปลอดภัย

### การตัดสินใจ

Settings จัดการ endpoint, enabled state และ eligible browser/client token ผ่าน service กลาง ค่า override อยู่ใน JavaScript memory ของหน้าและหายเมื่อ refresh Runtime market fixture ถูกปิด Company screen เรียก Business REST API ที่ตั้งค่า หรือแสดง empty/error state

Provider ปัจจุบันประกอบด้วย OSM tiles, Mapterhorn, OpenFreeMap, Nominatim, Overpass, Open-Meteo, WorldPop, TomTom และ Company Business API แต่ business logic ขึ้นกับ interface ไม่ใช่ provider name

### Validation และ safety

- Endpoint ต้องเป็น HTTPS หรือ localhost HTTP
- ห้าม commit key หรือใส่ default secret
- Browser key ต้องถูก provider อนุญาตและจำกัด domain/scope เมื่อทำได้
- Full refresh ล้าง token โดยตั้งใจ
- Provider timeout/error แยกกัน
- Settings ต้องบอกว่า quota/expiry telemetry มีได้เมื่อ provider API รองรับเท่านั้น

### ผลกระทบ

เปลี่ยน key/endpoint เพื่อการศึกษาได้เร็วโดยไม่ rebuild แต่ผู้ใช้ต้องกรอกใหม่หลัง refresh และ key ยังมองเห็นได้ใน browser Production ต้องย้าย confidential credentials ไป BFF/secret manager พร้อม rotation, usage monitoring และ audit

### Company API contract

รองรับ `/sites`, `/partners`, `/branches`, `/opportunities` และ collection response แบบ array หรือ `{ "data": [] }` Direct browser call ต้องมี CORS ที่เหมาะสม Production ควรใช้ same-origin BFF และ typed/versioned contract

### ทางเลือก

Hardcoded keys และ localStorage secrets ถูกปฏิเสธ Environment-only public values ไม่ตอบโจทย์ rotation จาก UI การทำ backend proxy ตั้งแต่แรกปลอดภัยกว่าแต่ถูกเลื่อนตาม frontend-first scope และต้องทำก่อน production

## English

### Context and decision

Users need replaceable free/quota-limited APIs without code edits, but localStorage or bundled secrets would create false security. Settings therefore manages endpoints, enabled state, and provider-approved browser/client tokens through a central service. Overrides remain in page memory and clear on refresh. Runtime market fixtures are disabled; company screens call a configured Business API or show honest empty/error states.

### Validation and consequences

Require HTTPS or localhost HTTP, commit no credentials, restrict eligible browser keys where possible, isolate timeouts/errors, and expose quota/expiry only when provider APIs support it. Runtime rotation is convenient but browser values remain inspectable and must be re-entered after refresh. Production moves confidential credentials to a BFF/secret manager with rotation, usage monitoring, and audit.

### Company API and alternatives

The prototype accepts arrays or `{ "data": [] }` from sites, partners, branches, and opportunities with suitable CORS. Production prefers a same-origin typed/versioned BFF. Hardcoded keys, localStorage secrets, and environment-only runtime rotation were rejected; a secure proxy is deferred only for the prototype and required before production.

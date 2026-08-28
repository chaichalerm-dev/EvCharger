# AI Development Guide / คู่มือการพัฒนาสำหรับ AI

เอกสารนี้เป็นกติกาบังคับสำหรับ AI coding agent และผู้พัฒนาที่แก้ไข EV Location & Expansion Intelligence Platform

This document defines mandatory rules for AI coding agents and developers modifying the EV Location & Expansion Intelligence Platform.

## ภาษาไทย

### 1. ลำดับการทำงานบังคับ

ก่อนแก้โค้ดทุกครั้งต้อง:

1. อ่าน `README.md` และ `AI.md` ให้ครบ
2. ตรวจโค้ด โครงสร้าง และ test ที่มีอยู่ก่อนสร้างสิ่งใหม่
3. ใช้ component, service, domain type, configuration และ repository contract เดิมเมื่อเหมาะสม
4. หลีกเลี่ยงตรรกะซ้ำและ component ขนาดใหญ่
5. ระบุสมมติฐานที่มีผลต่อธุรกิจอย่างชัดเจน
6. เพิ่มหรือแก้ test สำหรับพฤติกรรมสำคัญ
7. รัน typecheck, lint, test และ build ตามระดับความเสี่ยง
8. อัปเดตเอกสารและ ADR เมื่อพฤติกรรมหรือสถาปัตยกรรมเปลี่ยน
9. ตรวจว่าไม่มี secret, token, ข้อมูลส่วนบุคคล หรือ build artifact ถูก commit
10. สรุปสิ่งที่เปลี่ยน สิ่งที่ตรวจ และข้อจำกัดที่เหลือ

### 2. หลักสถาปัตยกรรม

- `app/` เป็น route, provider และ global CSS เท่านั้น หน้า route ควรบาง
- `src/features/` รวม UI ตามความสามารถทางธุรกิจ
- `src/components/` เก็บ component ที่ใช้ซ้ำ เช่น dialog, layout และ score bar
- `src/domain/` เก็บ model ที่ไม่ผูกกับ UI หรือ transport
- `src/config/` เก็บน้ำหนักคะแนน เกณฑ์ ประเภทสถานี รัศมี พื้นที่ให้บริการ และสิทธิ์
- `src/services/` เก็บตรรกะคำนวณ validation recommendation และ orchestration
- `src/providers/` แยกการเชื่อมต่อผู้ให้บริการภายนอกจากกฎธุรกิจ
- `src/repositories/` นิยามสัญญาการเข้าถึงข้อมูลและ implementation ที่เปลี่ยนได้
- `src/hooks/` เชื่อม feature กับ resource/query state โดยไม่ฝัง URL ใน component
- `tests/` และ `docs/` เป็นส่วนหนึ่งของ definition of done

Dependency direction ที่ต้องการคือ `feature → hook/service → interface → implementation` ห้ามให้ domain import React, MapLibre, fetch URL หรือ database client

### 3. กฎข้อมูลและ GIS

- พิกัดภายนอกใช้ WGS84 (`EPSG:4326`) เว้นแต่ระบุการแปลงอย่างชัดเจน
- หน่วยระยะทางต้องระบุเป็นเมตรหรือกิโลเมตร และพื้นที่เป็นตารางเมตร
- Estimated area ห้ามแสดงเป็น Verified area
- ข้อมูลสำคัญควรมี source, sourceUrl, collectedAt, lastUpdated, confidence และ verifiedStatus
- ข้อมูลที่ไม่มีต้องแสดง `Unknown` หรือ `Requires Site Survey`
- ผลจาก Open-Meteo Flood เป็นบริบท river discharge ไม่ใช่ parcel flood certification
- การค้นหารัศมีใน browser เป็นการประมาณสำหรับต้นแบบ งานจริงควรใช้ PostGIS geography
- อาคาร 3D ห้ามอ้างว่าครอบคลุมทั่วประเทศ เพราะขึ้นกับข้อมูลอาคาร OpenStreetMap
- Provider failure ต้องแยกจากกันและไม่ทำให้ทั้งแผนที่ล่ม

### 4. กฎธุรกิจ

- ห้ามเปลี่ยนน้ำหนักคะแนน เกณฑ์ recommendation พื้นที่สถานี CAPEX/OPEX หรือ permission โดยไม่บันทึกเหตุผลและ test
- ปัจจัย flood risk ใน score เป็นคะแนนความปลอดภัย: ค่าสูงหมายถึงปลอดภัยกว่า
- ความเสี่ยงวิกฤตสามารถ override คะแนนรวมได้
- Recommendation ต้องให้ reasons, risks และ missing information ไม่ใช่เพียงตัวเลข
- ข้อมูลไฟฟ้าที่ไม่ทราบห้ามถูกนับเป็นข้อได้เปรียบ
- Financial output ต้องระบุ Simulation, Estimate และไม่รับประกันผล
- Demo Role เป็น UX simulation เท่านั้น backend ในอนาคตต้องตรวจสิทธิ์ซ้ำทุก request

### 5. กฎ Real Provider Mode

- Runtime ห้ามเพิ่มข้อมูลตลาดสมมติลงหน้าธุรกิจโดยเงียบ
- Public provider ถูกเรียกเมื่อผู้ใช้สั่งเท่านั้น พร้อม timeout, ขอบเขต request และ partial-failure handling
- Company screens ต้องแสดง empty/error state เมื่อ Business API ไม่พร้อม
- Endpoint และ browser/client token ที่เปลี่ยนได้ต้องผ่าน service configuration ไม่ฝังใน component
- Token ที่ผู้ใช้กรอกต้องอยู่ใน memory เท่านั้น ห้ามเก็บใน localStorage
- Secret production ต้องอยู่หลัง backend/BFF เท่านั้น
- Test fixture อนุญาตเฉพาะใน test หรือ development reference ที่ไม่ต่อเข้า runtime

### 6. ความปลอดภัย

ห้ามสร้าง backdoor, bypass route, hidden admin password, hardcoded production credential หรือ fake security control ใช้ React text rendering แทน unsafe HTML ตรวจ URL และ input ด้วย schema จำกัดขนาด/ชนิดไฟล์ และ revoke object URL หลังใช้ ห้าม log token หรือข้อมูลส่วนบุคคล

เมื่อมี backend ให้ใช้ parameterized query, server-side authorization, rate limit, CSRF/SSRF strategy, audit log, secret manager, object storage แบบ private และ security headers Frontend permission ใช้เพื่อ UX เท่านั้น

### 7. UI, ภาษา และ accessibility

- ข้อความที่ผู้ใช้เห็นต้องรองรับ translation key หรือรูปแบบ bilingual ที่กำหนด
- ค่าเริ่มต้นครั้งแรกคือภาษาไทยและโหมดสว่าง
- ใช้ Noto Sans Thai สำหรับไทยและ Noto Sans สำหรับอังกฤษ
- ปุ่มไอคอนต้องมี `aria-label` และ `title` เมื่อชื่อมองไม่เห็น
- dialog ต้องจัดการ focus และใช้งานด้วยคีย์บอร์ด
- ห้ามใช้สีเป็นสัญญาณเดียว ไอคอน/ข้อความต้องช่วยอธิบาย
- แผนที่บนมือถือควรรักษาพื้นที่ใช้งานและหลีกเลี่ยง overlay ที่เกะกะ
- ต้องมี loading, empty, error และ unavailable state ในหน้าสำคัญ

### 8. Testing และ Git

- Pure business logic ใช้ Vitest
- Component behavior ใช้ React Testing Library
- เส้นทางผู้ใช้สำคัญและ responsive behavior ใช้ Playwright
- Commit ต้องโฟกัสเรื่องเดียวและไม่รวมการแก้ของผู้ใช้อื่นโดยไม่ตั้งใจ
- ห้ามใช้ destructive reset กับ worktree ที่มีการแก้ไข
- Changelog ใช้วันที่ ISO และอธิบายผลต่อผู้ใช้

### 9. กฎเอกสาร

- เอกสารโครงการต้องมีภาษาไทยและอังกฤษ โดยไทยมาก่อนในไฟล์หลัก
- คำอธิบายต้องแยกสิ่งที่ implemented, simulated, estimated และ future
- ห้ามอ้างว่า real-time, production-secure, database-backed หรือ production authentication หากยังไม่จริง
- เมื่อแก้ provider ให้ปรับ `DATA-SOURCES.md`, `SECURITY.md` และ ADR ที่เกี่ยวข้อง
- เมื่อแก้คะแนนให้ปรับ `SCORING.md`, `BUSINESS-LOGIC.md`, assumptions, tests และ version
- เมื่อแก้แผนที่ให้ปรับ `MAP.md` และ accessibility/responsive tests

---

## English

### 1. Mandatory workflow

Before changing code:

1. Read `README.md` and `AI.md` completely.
2. Inspect existing code, architecture, and tests before creating new structures.
3. Reuse existing components, services, domain types, configuration, and repository contracts.
4. Avoid duplicate logic and oversized components.
5. State assumptions that materially affect business behavior.
6. Add or update tests for important behavior.
7. Run typecheck, lint, tests, and builds in proportion to risk.
8. Update documentation and ADRs when behavior or architecture changes.
9. Confirm that no secrets, tokens, personal data, or build artifacts are committed.
10. Report what changed, what was validated, and what remains limited.

### 2. Architecture rules

- `app/` contains routes, providers, and global CSS; route pages stay thin.
- `src/features/` groups UI by business capability.
- `src/components/` contains reusable layout, dialog, and visualization components.
- `src/domain/` contains models independent of UI and transport.
- `src/config/` owns weights, thresholds, station assumptions, radii, coverage, and permissions.
- `src/services/` owns calculations, validation, recommendation, and orchestration.
- `src/providers/` isolates external-provider integration from business rules.
- `src/repositories/` defines replaceable data-access contracts and implementations.
- `src/hooks/` connects features to resource/query state without embedding URLs in components.
- `tests/` and `docs/` are part of the definition of done.

The intended dependency direction is `feature → hook/service → interface → implementation`. Domain code must not import React, MapLibre, fetch URLs, or database clients.

### 3. Data and GIS rules

- External coordinates use WGS84 (`EPSG:4326`) unless transformation is explicit.
- Distance and area units must be explicit.
- Estimated area must never be presented as verified area.
- Important observations support source, sourceUrl, collectedAt, lastUpdated, confidence, and verifiedStatus.
- Missing facts render as `Unknown` or `Requires Site Survey`.
- Open-Meteo Flood output is river-discharge context, not parcel flood certification.
- Browser radius operations are prototype approximations; production uses PostGIS geography.
- Never claim nationwide 3D building coverage; it depends on OpenStreetMap building data.
- Provider failures remain isolated and must not crash the map.

### 4. Business rules

- Do not change weights, recommendation thresholds, station footprints, CAPEX/OPEX, or permissions without documented rationale and tests.
- The flood-risk score is a safety score: higher is safer.
- Critical risks may override the overall score.
- Recommendations include reasons, risks, and missing information, not only a number.
- Unknown electrical capacity is never counted as a positive fact.
- Financial output is labelled Simulation and Estimate and is not a guarantee.
- Demo Role is a UX simulation; a future backend must authorize every request independently.

### 5. Real Provider Mode rules

- Runtime must not silently inject fictional market data into business screens.
- Public providers are called only after user action with timeouts, bounded requests, and partial-failure handling.
- Company screens show honest empty/error states when the Business API is unavailable.
- Replaceable endpoints and eligible browser/client tokens go through configuration services, never feature components.
- User-entered tokens remain in memory only and must not be written to localStorage.
- Production secrets belong behind a backend/BFF.
- Test fixtures are allowed only in tests or isolated development references not wired into runtime.

### 6. Security

Never create backdoors, bypass routes, hidden admin passwords, hardcoded production credentials, or fake controls. Prefer React text rendering to unsafe HTML. Validate URLs and inputs with schemas, limit file type/size, revoke object URLs, and never log tokens or personal data.

A future backend requires parameterized queries, server-side authorization, rate limits, CSRF/SSRF controls, audit logs, secret management, private object storage, and security headers. Frontend permissions are UX only.

### 7. UI, language, and accessibility

- User-facing copy follows translation keys or the defined bilingual documentation structure.
- First-run defaults are Thai and light mode.
- Use Noto Sans Thai for Thai and Noto Sans for English.
- Icon-only buttons require accessible names and hover titles.
- Dialogs manage focus and keyboard operation.
- Never rely on color alone; include icons or text.
- Preserve usable mobile map space and avoid obstructive overlays.
- Important screens support loading, empty, error, and unavailable states.

### 8. Testing and Git

- Use Vitest for pure business logic.
- Use React Testing Library for component behavior.
- Use Playwright for critical journeys and responsive behavior.
- Keep commits focused and preserve unrelated user changes.
- Never use destructive resets on a dirty worktree.
- Changelog entries use ISO dates and describe user impact.

### 9. Documentation rules

- Project documentation must contain Thai and English, with Thai first in primary documents.
- Clearly separate implemented, simulated, estimated, and future capabilities.
- Never claim real-time, production-secure, database-backed, or production authentication when untrue.
- Provider changes update `DATA-SOURCES.md`, `SECURITY.md`, and relevant ADRs.
- Scoring changes update `SCORING.md`, `BUSINESS-LOGIC.md`, assumptions, tests, and versioning.
- Map changes update `MAP.md` and accessibility/responsive tests.

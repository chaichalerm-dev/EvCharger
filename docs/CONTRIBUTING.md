# Contributing / แนวทางการมีส่วนร่วม

## ภาษาไทย

### ก่อนเริ่ม

อ่าน `README.md`, `AI.md` และเอกสาร feature ที่เกี่ยวข้อง ตรวจ worktree และ code เดิมก่อนแก้ สร้าง branch/commit ที่โฟกัสเรื่องเดียวและรักษาการแก้ไขที่ไม่เกี่ยวข้องของผู้อื่น

### ขั้นตอน

1. อธิบายปัญหา ผลลัพธ์ที่ต้องการ และ business rule ที่เกี่ยวข้อง
2. หา component/service/config/interface เดิมที่จะ reuse
3. แก้ที่ boundary ที่ถูกต้อง ไม่ฝัง logic ใน page
4. เพิ่ม test ตามความเสี่ยง
5. รัน typecheck, lint, test และ build ที่เกี่ยวข้อง
6. อัปเดตเอกสารสองภาษาและ ADR เมื่อจำเป็น
7. ตรวจ diff, secret, generated file และ accessibility
8. เขียน commit/review summary ที่บอก user impact และ limitation

### กฎสำคัญ

- ห้าม commit `.env`, token, key, personal submission, production data หรือ build output
- ห้ามเปลี่ยน score weights, thresholds, permissions, station/financial assumptions หรือ quality semantics โดยไม่มี explicit decision และ test
- ห้ามสร้าง backdoor, unsafe HTML หรือ client-side fake security
- ห้าม import fixture เข้า runtime business screen
- Provider ใหม่ต้องผ่าน interface, timeout, validation, error isolation, licensing และ security review
- UI text ใหม่ต้องรองรับไทย/อังกฤษและ keyboard/screen reader
- API/database change ต้องมี compatibility/migration/rollback plan

### Pull request checklist

- Scope และเหตุผลชัดเจน
- Test ผ่านและครอบคลุม regression สำคัญ
- Loading/empty/error/unavailable states ครบ
- ไม่มีข้อมูลที่อ้างว่า verified/real-time โดยไม่มีหลักฐาน
- Documentation/ADR/CHANGELOG อัปเดต
- Screenshot แนบเฉพาะเมื่อช่วย review visual change

---

## English

### Before starting

Read `README.md`, `AI.md`, and relevant feature documentation. Inspect the worktree and existing code. Keep branches and commits focused and preserve unrelated user changes.

### Workflow

Define the problem and business rule, reuse the correct boundary, implement without page-level business logic, add risk-based tests, run validation, update bilingual docs/ADRs, inspect the diff for secrets/generated files/accessibility, and write a user-impact summary.

### Rules

Never commit environment files, credentials, personal submissions, production data, or build output. Do not silently change scoring, permissions, station/financial assumptions, or quality semantics. Do not create backdoors, unsafe HTML, fake client security, or runtime fixture imports. New providers require interfaces, bounded requests, validation, isolated errors, licensing review, and security review. UI remains bilingual and accessible. API/database changes require compatibility, migration, and rollback plans.

### Review checklist

Confirm scope, regression coverage, state handling, honest quality claims, updated documentation/ADR/changelog, and screenshots only when they materially help visual review.

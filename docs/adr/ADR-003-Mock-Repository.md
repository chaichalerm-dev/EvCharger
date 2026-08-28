# ADR-003: Replaceable Repositories / Repository ที่เปลี่ยน implementation ได้

- **Status / สถานะ:** Accepted, amended for Real Provider Mode / ยอมรับและแก้ไขตาม Real Provider Mode
- **Original date / วันที่เดิม:** 2026-08-26

## ภาษาไทย

### บริบท

UI ต้องไม่ผูกกับ local fixture หรือ REST response โดยตรง เดิมต้นแบบใช้ mock repository แต่ภายหลังผู้ใช้กำหนดให้ runtime ใช้ API จริงและไม่แสดง mock market data

### การตัดสินใจ

คง repository interface และ service boundary แต่เปลี่ยน runtime wiring:

- Company collection ใช้ Business API adapter เมื่อกำหนด
- เมื่อไม่มี API ใช้ honest empty/error repository ไม่สร้างข้อมูลสมมติ
- LocalStorageRepository ใช้เฉพาะ partner submission ที่ติดป้าย prototype
- Mock/test repository อนุญาตเฉพาะ automated test และ isolated development reference
- Provider observation ใช้ provider interface ไม่ปะปนกับ company repository

### ผลกระทบ

Feature component ไม่ต้องเปลี่ยนเมื่อย้ายไป ApiRepository จริง Test ยัง inject deterministic repository ได้ แต่ dashboard อาจว่างใน demo ถ้าไม่เชื่อม Company API ซึ่งเป็นพฤติกรรมที่ซื่อสัตย์ต่อข้อมูล

### กติกา migration

API adapter ต้อง validate DTO, map domain type, แปลง error มาตรฐาน และรองรับ pagination/version ก่อน production ห้ามให้ UI จัดการ raw fetch URL หรือ bearer token โดยตรง

## English

### Context and amended decision

UI must not depend on fixtures or transport responses. The project originally used mock repositories, but runtime was later changed to Real Provider Mode. Keep repository interfaces while wiring company collections to an optional Business API, honest empty/error fallbacks, and a local repository only for explicitly labelled prototype submissions. Mocks remain test-only.

### Consequences

Feature UI can adopt real API repositories without rewrite and tests remain deterministic. A disconnected company portfolio is intentionally empty rather than fictional. Production adapters validate/map DTOs, standardize errors, and add pagination/versioning without leaking fetch or credentials into components.

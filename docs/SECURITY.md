# Security / ความปลอดภัย

## ภาษาไทย

### ขอบเขต

ระบบนี้เป็น functional prototype ไม่ใช่ production-secure application ไม่มี production authentication, backend authorization หรือ database security เอกสารนี้แยกสิ่งที่ทำแล้วกับสิ่งที่ต้องทำก่อน production

### สิ่งที่ทำแล้วในต้นแบบ

- React render ข้อความโดยไม่ใช้ unsafe HTML
- Zod validation และจำกัดความยาว/ช่วงตัวเลขใน form สำคัญ
- Endpoint validation อนุญาต HTTPS และ localhost HTTP
- Token จาก Settings อยู่ใน memory และหายเมื่อ refresh
- ไม่มี production secret, hidden password หรือ bypass route ใน source
- Prototype photo preview ตรวจชนิดและขนาด 3 MB ไม่ upload/execute และ revoke object URL
- Demo permission รวมศูนย์สำหรับ UX และมี confirmation dialog สำหรับ action สำคัญ
- แสดงคำเตือนว่า Demo Role/localStorage ไม่ใช่ security
- Public-provider request เป็น user-triggered มี timeout ขอบเขต และ partial-failure handling
- พิกัด/polygon ถูกส่งให้ provider เฉพาะเมื่อผู้ใช้เรียกข้อมูลที่เกี่ยวข้อง

### สิ่งที่ต้นแบบไม่ได้ให้

- ไม่ยืนยันตัวตนหรือ session อย่างปลอดภัย
- ไม่ enforce authorization ฝั่ง server
- ไม่เข้ารหัส localStorage submission
- ไม่ป้องกันผู้ใช้ที่ควบคุม browser จากการแก้ client state
- ไม่ซ่อน browser-visible API key
- ไม่ให้ SLA, incident response หรือ audit trail ที่เชื่อถือได้

### ข้อกำหนด production

#### Identity และ authorization

OIDC/Supabase Auth หรือ backend auth, secure cookie, session rotation, MFA สำหรับ role สำคัญ, server-side RBAC/ABAC, ownership/tenant checks, RLS defense in depth, least privilege และ break-glass ที่ audit ได้

#### Web/API

Schema validation, output encoding, CSP, HSTS, frame policy, referrer/permissions policy, CSRF protection ตาม auth model, CORS allow-list, safe redirect, SSRF destination allow-list, parameterized query, rate limit, quota, idempotency และ request size limit

#### Secret และ provider key

เก็บใน secret manager ฝั่ง server แยก environment จำกัด domain/IP/API scope เมื่อ provider รองรับ หมุน key ตามนโยบาย แสดง usage/expiry health โดยไม่แสดงค่า secret และ audit การอ่าน/เปลี่ยน key

#### File upload

Private object storage, signed short-lived upload, MIME + magic-byte check, image re-encoding เมื่อเหมาะสม, malware scan, filename normalization, metadata stripping, size/count limit, authorization on download และ retention/deletion policy

#### Database และ operations

Encryption in transit/at rest, backup/restore test, immutable audit, log redaction, alerting, dependency/SAST/DAST scanning, incident playbook, vulnerability management, penetration test และ disaster recovery exercise

### Threats ที่ต้องพิจารณา

XSS, CSRF, SSRF, broken access control, injection, mass assignment, insecure direct object reference, malicious upload, API abuse, quota exhaustion, geospatial denial of service, stale/poisoned provider data, supply-chain risk และ sensitive location leakage

### PDPA ประเทศไทย

ระบุวัตถุประสงค์และฐานกฎหมาย ลดข้อมูลให้เท่าที่จำเป็น แจ้ง privacy notice จัดการ consent เมื่อจำเป็น กำหนด retention/right request/processor agreement/cross-border transfer/breach response และประเมิน DPIA เมื่อข้อมูลตำแหน่งหรือบุคคลมีความเสี่ยง ขอ legal review ก่อนใช้งานจริง

### Token guidance

Browser-visible key ไม่ใช่ secret แม้จำกัด domain ได้ Production traffic ไป provider ที่ต้องใช้ secret ควรผ่าน same-origin BFF/proxy ที่ตรวจ provider allow-list, user authorization, rate limit และ audit

---

## English

### Scope

This is a functional prototype, not a production-secure application. It does not provide production identity, backend authorization, or database controls. This document separates implemented safeguards from production requirements.

### Implemented prototype safeguards

React text rendering, schema validation, safe endpoint rules, memory-only runtime tokens, no embedded production credentials, bounded local photo preview, centralized Demo permission UX, confirmation dialogs, explicit insecurity warnings, and bounded user-triggered provider requests reduce prototype risk.

### Not provided

The prototype does not securely authenticate, enforce server authorization, encrypt localStorage, resist a user controlling client state, hide browser-visible keys, or provide production SLA, incident response, or trusted audit.

### Production requirements

Add secure identity/session/MFA, server RBAC/ABAC, tenant ownership, RLS defense in depth, schema validation, security headers, CSRF/CORS/SSRF controls, parameterized SQL, rate limits, idempotency, server secret management, private scanned uploads, encryption, tested backups, immutable audit, redacted logs, monitoring, security scanning, incident response, penetration testing, and disaster recovery.

### Threat model and PDPA

Address XSS, CSRF, SSRF, access-control failures, injection, mass assignment, IDOR, malicious uploads, API abuse, quota exhaustion, geospatial DoS, provider-data poisoning, supply-chain risk, and location leakage. Thailand PDPA requires purpose, legal basis, minimization, notices, consent where applicable, retention, rights handling, processor agreements, transfer controls, breach response, and legal review.

### Token guidance

A browser-visible key is not a secret. Production requests requiring confidential credentials should pass through a same-origin BFF/proxy with provider allow-listing, authorization, rate limiting, and audit.

# Security / ความปลอดภัย

## ภาษาไทย

### ขอบเขต

ระบบนี้เป็น functional prototype ไม่ใช่ production-secure application ไม่มี production authentication, backend authorization หรือ database security เอกสารนี้แยกสิ่งที่ทำแล้วกับสิ่งที่ต้องทำก่อน production

### สิ่งที่ทำแล้วในต้นแบบ

- HTTP security headers สำหรับหน้าเว็บ: CSP แบบ nonce ต่อ request, HSTS, `nosniff`, anti-framing, Referrer Policy, Permissions Policy, COOP/CORP และการปิด legacy XSS auditor
- Production CSP ไม่ใช้ `unsafe-inline` หรือ `unsafe-eval` ใน `script-src`; development อนุญาต `unsafe-eval` เฉพาะเพื่อเครื่องมือ debug ของ React
- CSP ห้าม object, frame ancestor, inline event handler และจำกัด script ไว้ที่ไฟล์ของแอปที่ได้รับ nonce
- `connect-src https:` และ `img-src https:` เปิดไว้โดยตั้งใจ เพราะผู้ใช้เปลี่ยน endpoint ของ data provider ได้จาก Settings; script จากภายนอกยังถูกห้าม
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
- คะแนนจากเครื่องมือตรวจภายนอกขึ้นกับ response ที่เครื่องมือนั้นเข้าถึงจริง หากโดเมนเป็น owner-only เครื่องมือจะตรวจหน้า access gateway ของผู้ให้บริการ hosting แทน response ของแอป

### การตรวจ HTTP security headers

Response ของหน้าแอปต้องมี `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` และ `Permissions-Policy` ครบ ชุดค่าถูกกำหนดรวมศูนย์ใน `src/config/security-headers.ts` และสร้าง nonce ใหม่ใน `proxy.ts` ทุก request

ตรวจหลัง deploy ด้วย:

```bash
curl -I https://your-domain.example/
```

จากนั้นสแกนโดเมนสาธารณะที่เข้าถึงได้ด้วย SecurityHeaders.com การได้ A+ หมายถึงชุด response headers ที่เครื่องมือพบครบตามเกณฑ์ ไม่ได้หมายความว่าแอปปลอดภัยระดับ production หรือผ่าน penetration test

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

Page responses use a per-request nonce CSP, HSTS, MIME-sniffing protection, anti-framing controls, Referrer Policy, Permissions Policy, COOP/CORP, and conservative legacy fallbacks. Production `script-src` contains neither `unsafe-inline` nor `unsafe-eval`. Development alone permits `unsafe-eval` for React debugging. External scripts remain blocked.

The CSP intentionally permits HTTPS data and image connections because provider endpoints are replaceable in Settings. This is broader than a fixed provider allow-list but preserves the documented provider abstraction without allowing third-party script execution.

React text rendering, schema validation, safe endpoint rules, memory-only runtime tokens, no embedded production credentials, bounded local photo preview, centralized Demo permission UX, confirmation dialogs, explicit insecurity warnings, and bounded user-triggered provider requests further reduce prototype risk.

### Not provided

The prototype does not securely authenticate, enforce server authorization, encrypt localStorage, resist a user controlling client state, hide browser-visible keys, or provide production SLA, incident response, or trusted audit. An external scanner can inspect only the response it can reach; an owner-only deployment may expose the hosting access gateway instead of application headers.

### HTTP-header verification

The required application-page response set is `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. Configuration is centralized in `src/config/security-headers.ts`; `proxy.ts` generates a new nonce for every page request.

After deployment, inspect the public response with `curl -I https://your-domain.example/`, then scan a publicly reachable domain with SecurityHeaders.com. An A+ reports header coverage observed by that scanner; it is not a production-security certification or penetration test.

### Production requirements

Add secure identity/session/MFA, server RBAC/ABAC, tenant ownership, RLS defense in depth, schema validation, security headers, CSRF/CORS/SSRF controls, parameterized SQL, rate limits, idempotency, server secret management, private scanned uploads, encryption, tested backups, immutable audit, redacted logs, monitoring, security scanning, incident response, penetration testing, and disaster recovery.

### Threat model and PDPA

Address XSS, CSRF, SSRF, access-control failures, injection, mass assignment, IDOR, malicious uploads, API abuse, quota exhaustion, geospatial DoS, provider-data poisoning, supply-chain risk, and location leakage. Thailand PDPA requires purpose, legal basis, minimization, notices, consent where applicable, retention, rights handling, processor agreements, transfer controls, breach response, and legal review.

### Token guidance

A browser-visible key is not a secret. Production requests requiring confidential credentials should pass through a same-origin BFF/proxy with provider allow-listing, authorization, rate limiting, and audit.

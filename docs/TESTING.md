# Testing Strategy / กลยุทธ์การทดสอบ

## ภาษาไทย

### หลักการ

ทดสอบตามความเสี่ยง: pure business rule ใช้ unit test, interaction/component ใช้ React Testing Library และเส้นทางผู้ใช้พร้อม responsive behavior ใช้ Playwright Test ต้อง deterministic ไม่พึ่ง public provider จริงเมื่อสามารถ route/stub ได้

### Unit และ component tests

Vitest/React Testing Library ครอบคลุม:

- Weighted scoring และ configuration version
- High flood override
- Area verification risk และ missing electrical information
- Site search/filter ภาษาไทยและอังกฤษ
- Empty/error behavior
- Partner submission schema และ file limits
- Demo Role permission
- Confirmation dialog accessibility
- API connection defaults และ replaceable providers
- Arbitrary-location analysis
- ชุด security headers ที่ SecurityHeaders.com ตรวจ, HSTS และ production CSP แบบ nonce ที่ไม่มี unsafe script directive

### End-to-end tests

Playwright รัน desktop และ mobile projects ครอบคลุม:

- ค้นหา เลือกจุด เปลี่ยนรัศมี/พื้นที่ และคำนวณใหม่
- Public-provider partial context ด้วย network stubs
- 3D state และ icon-only control
- Layer list ถาวรและ legend พับ/ขยาย
- ภาษาไทย/อังกฤษและ light/dark
- Sidebar collapse persistence และ mobile drawer
- Active navigation เพียงหนึ่งรายการ
- First-time journey จากหน้าแรกไป action ถัดไป

### คำสั่ง

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run build:vercel
```

### Manual checks ที่ยังจำเป็น

- Keyboard-only flow และ screen-reader labels
- Focus order ของ dialog/drawer
- Contrast ทั้งสอง theme
- Touch target และ map gesture บนอุปกรณ์จริง
- Attribution และ provider terms
- จุดใกล้ขอบประเทศไทย พื้นที่ราบ และพื้นที่ภูเขาใน 3D
- Network ช้า offline quota exceeded และ malformed response
- ข้อความ Unknown/Estimated/Verified ไม่ทำให้เข้าใจผิด
- Response headers ของโดเมนที่ deploy จริง รวมถึงกรณี hosting access gateway ตอบแทนตัวแอป

### Test data

Fixture ใน test ต้องระบุว่าเป็น test data และห้ามต่อเข้า runtime Company portfolio Stubs ต้องไม่บรรจุ secret หรือข้อมูลส่วนบุคคล Production contract tests ควรใช้ sanitized schema examples

### เกณฑ์ release

Typecheck, lint, critical tests และ deployment build ต้องผ่าน ไม่มี uncaught runtime error ใน flow หลัก Known warning ต้องมี owner/risk acceptance งาน backend ในอนาคตต้องเพิ่ม API contract, authorization, migration, PostGIS, concurrency, queue และ security tests

---

## English

### Principles

Test by risk: pure business rules use unit tests, interactions use React Testing Library, and critical responsive journeys use Playwright. Tests remain deterministic and stub public networks whenever practical.

### Coverage

Unit/component coverage includes scoring, flood overrides, area and electrical gaps, bilingual search/filtering, empty/error behavior, submission validation, Demo permissions, confirmation accessibility, API configuration, arbitrary-location analysis, the required security-header set, HSTS, and a nonce-based production CSP without unsafe script directives.

Playwright covers desktop/mobile search and recalculation, partial provider context, 3D controls, persistent layer controls, collapsible legend, language/theme, sidebar/mobile navigation, active routes, and the first-time journey.

### Commands and manual checks

Run the commands above. Manual checks still cover keyboard/screen-reader behavior, focus, contrast, touch and map gestures, attribution, Thailand edge locations, flat/mountain 3D, adverse networks, honest quality labels, and deployed response headers. Distinguish application responses from a hosting access gateway response.

### Data and release gates

Test fixtures are explicitly test-only and never populate runtime company screens. No secrets or personal data belong in fixtures. Release requires typecheck, lint, critical tests, and deployment builds to pass with no uncaught primary-flow errors. Future backend work adds contracts, authorization, migration, PostGIS, concurrency, queue, and security testing.

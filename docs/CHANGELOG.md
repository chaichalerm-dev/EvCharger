# Changelog / บันทึกการเปลี่ยนแปลง

รูปแบบวันที่ใช้ ISO (`YYYY-MM-DD`) และอธิบายทั้งผลต่อผู้ใช้และผลทางเทคนิค

Dates use ISO format and entries describe user and technical impact.

## 0.8.1 — 2026-08-31

### ภาษาไทย

- ออกแบบ brand mark ใหม่ให้เป็นหมุดทำเลแบบ Electric Blue/Cyan มีสายฟ้าสีขาวและวงจรพลังงานบนพื้น Navy
- เปลี่ยนทั้งโลโก้ sidebar และ favicon ให้ใช้อัตลักษณ์เดียวกัน
- ใช้ชื่อไฟล์ asset ใหม่เพื่อหลีกเลี่ยง favicon cache จากเวอร์ชันสีเขียวเดิม

### English

- Redesigned the brand mark as an Electric Blue/Cyan location pin with a white charging bolt and energy-circuit details on Navy.
- Applied the same identity to the sidebar logo and browser favicon.
- Introduced a new asset filename to bypass stale browser caches from the previous green version.

## 0.8.0 — 2026-08-31

### ภาษาไทย

- เปลี่ยนภาพลักษณ์หลักจากสีเขียวเป็น Electric Blue และ Cyan เพื่อสื่อถึงพลังงานไฟฟ้า เทคโนโลยี และข้อมูลตำแหน่ง
- ปรับ design tokens ทั้งโหมดสว่างและมืด รวมพื้นหลัง panel เส้นขอบ ตัวอักษร เงา ปุ่มหลัก sidebar และสถานะ active
- ปรับสีแผนที่ พื้นที่วิเคราะห์ หมุด EV, POI, Opportunity, จุดที่เลือก และ cluster ให้แยกประเภทได้ชัดเจน
- ปรับโลโก้และ favicon ให้ใช้ชุดสีเดียวกับธีมใหม่ พร้อมเพิ่ม E2E test ตรวจค่าสีหลักของ light/dark theme

### English

- Shifted the primary identity from green to Electric Blue and Cyan to communicate electricity, technology, and location intelligence.
- Updated light and dark design tokens across backgrounds, panels, borders, typography, shadows, primary actions, sidebar, and active states.
- Recolored the map analysis area and EV, POI, opportunity, selected, and cluster symbols for clear category separation.
- Aligned the logo and favicon with the new palette and added E2E coverage for light/dark primary colors.

## 0.7.1 — 2026-08-28

### ภาษาไทย

- เพิ่มอัตลักษณ์ EV Atlas Thailand ด้วยสัญลักษณ์หมุดทำเลและสายฟ้าชาร์จในสีประจำระบบ
- ปรับโลโก้ sidebar ให้เป็นลิงก์กลับหน้าหลัก รองรับชื่อที่ screen reader อ่านได้ และมีรูปแบบย่อที่ชัดเจน
- เปลี่ยน favicon เริ่มต้น พร้อมกำหนด icon metadata ให้ browser และ deployment ใช้ asset เดียวกัน

### English

- Added EV Atlas Thailand branding with a location-pin and charging-bolt mark in the product palette.
- Turned the sidebar logo into an accessible home link with a clear collapsed treatment.
- Replaced the starter favicon and declared icon metadata so browsers and deployments use the same asset.

## 0.7.0 — 2026-08-28

### ภาษาไทย

- เขียน Markdown ทั้งโครงการใหม่เป็นไทยและอังกฤษ ครอบคลุมผลิตภัณฑ์ สถาปัตยกรรม GIS ข้อมูล คะแนน ความปลอดภัย การติดตั้ง การทดสอบ การแก้ปัญหา การส่งมอบ และ ADR
- แก้เอกสารให้ตรงกับ Real Provider Mode, memory-only tokens, Company API empty states, Mapterhorn terrain, OpenFreeMap building coverage, map UI แบบกะทัดรัด และข้อจำกัดปัจจุบัน
- เพิ่ม documentation governance สำหรับ AI/developer และแยก Implemented, Prototype, Estimate และ Future อย่างชัดเจน

### English

- Rewrote all project Markdown in Thai and English across product, architecture, GIS, data, scoring, security, deployment, testing, troubleshooting, handoff, and ADRs.
- Aligned documentation with Real Provider Mode, memory-only tokens, honest Company API empty states, Mapterhorn terrain, OpenFreeMap building limits, compact map UI, and current limitations.
- Added documentation governance for agents/developers and explicit separation of Implemented, Prototype, Estimate, and Future capabilities.

## 0.6.7 — 2026-08-27

### ภาษาไทย

- นำป้ายขอบเขตประเทศไทยและคำแนะนำให้คลิกออกจาก canvas เพื่อลดสิ่งรบกวน
- เปลี่ยน 3D/2D และ recenter เป็น icon-only พร้อม accessible name และ tooltip

### English

- Removed redundant Thailand-coverage and click-instruction overlays.
- Reduced 3D/2D and recenter actions to accessible icon-only controls.

## 0.6.6 — 2026-08-27

### ภาษาไทย

- เปลี่ยน legend ขนาดใหญ่เป็นปุ่มกะทัดรัดที่พับโดยค่าเริ่มต้น รองรับ desktop/mobile
- คง layer controls ทั้งหมดในแผงวิเคราะห์ และแสดง category ครบเมื่อเปิด legend

### English

- Replaced the always-open legend with a compact collapsed-by-default control.
- Kept the full layer list visible and preserved all categories inside the opened legend.

## 0.6.5 — 2026-08-27

### ภาษาไทย

- ให้ layer controls และไอคอนทุก category มองเห็นเสมอ พร้อม on/off state
- เพิ่ม score bar แบบ accessible แบ่งสีและเส้นอ้างอิง 60/75

### English

- Kept every layer category identifiable with clear enabled/disabled state.
- Added accessible color-banded score bars with 60/75 reference markers.

## 0.6.4 — 2026-08-27

### ภาษาไทย

- เพิ่ม Mapterhorn terrain/hillshade แยกจาก building coverage
- 3D กลับไป selected location ใช้ pitch 65°, antialias และ building extrusion ตั้งแต่ zoom 14
- เพิ่มสถานะ terrain+building, terrain-only, loading และ unavailable ตามจริง

### English

- Added global Mapterhorn terrain/hillshade independently from buildings.
- Centered 3D on the selected point with 65° pitch, antialiasing, and buildings from zoom 14.
- Added honest terrain/building readiness states and replaceable provider configuration.

## 0.6.3 — 2026-08-27

### ภาษาไทย

- เพิ่ม zoom-dependent scaling ให้ icon, selected marker, cluster และ count เล็กลงในระดับประเทศ/จังหวัด

### English

- Added capped zoom-dependent scaling so symbols and clusters shrink at overview zoom instead of covering the map.

## 0.6.2 — 2026-08-27

### ภาษาไทย

- เปลี่ยนจุดสีที่กำกวมเป็น Lucide icon ตาม category และใช้สีเป็นสัญญาณรอง
- เพิ่ม icon ให้ layer control, fallback marker, cluster และ legend

### English

- Replaced ambiguous colored dots with category pictograms and secondary color cues.
- Matched symbols across layer controls, fallback markers, clusters, and legend.

## 0.6.1 — 2026-08-27

### ภาษาไทย

- แก้ sidebar ให้ active ตาม route ปัจจุบันเพียงหน้าเดียว พร้อม `aria-current="page"`

### English

- Made sidebar active state route-driven and exposed `aria-current="page"`.

## 0.6.0 — 2026-08-27

### ภาษาไทย

- ออกแบบหน้าแรกใหม่ให้เริ่มจากค้นหาทำเลและอธิบาย journey 3 ขั้นตอน
- ทำ header search ให้เปิด Map Explorer ได้จริง
- จัด map flow เป็น select location → set area → review recommendation
- ทำ Analyze this area เป็น action หลักและลดรายละเอียด provider ใน pending state

### English

- Rebuilt the start experience around one location-search action and a three-step journey.
- Made header search functional, promoted explicit Analyze, and simplified pending/provider detail.

## 0.5.0 — 2026-08-26

### ภาษาไทย

- เพิ่ม sidebar ย่อได้และ mobile drawer แบบไม่ซ้ำ control
- ตั้ง first-run เป็นภาษาไทยและ light mode พร้อม Noto Sans Thai/Noto Sans
- แปล primary workflow ไทย/อังกฤษและเพิ่ม E2E สำหรับ theme/language/sidebar

### English

- Added collapsible desktop navigation and a single-control mobile drawer.
- Set Thai/light first-run defaults, bundled bilingual fonts, localized primary workflows, and added E2E coverage.

## 0.4.0 — 2026-08-26

### ภาษาไทย

- เปลี่ยน runtime จาก mock market repositories เป็น Real Provider Mode พร้อม empty states
- เพิ่ม endpoint/token controls สำหรับ OSM, OpenFreeMap, Nominatim, Overpass, Open-Meteo, WorldPop, TomTom และ Company API
- เพิ่ม WorldPop/TomTom analysis และ memory-only token policy

### English

- Switched runtime market screens to Real Provider Mode with honest empty states.
- Added replaceable public/company provider settings, WorldPop/TomTom analysis, and memory-only token handling.

## 0.3.0 — 2026-08-26

### ภาษาไทย

- เพิ่ม OpenFreeMap 3D buildings และ public context จาก Overpass/Open-Meteo
- เพิ่ม timeout, throttling, cache, attribution และ partial-failure handling
- จำกัด navigation/search ในประเทศไทยและแก้ marker ไม่ให้ขยายบังพื้นที่เมื่อ zoom out/3D

### English

- Added OpenFreeMap 3D buildings and Overpass/Open-Meteo context.
- Added bounded provider calls, caching, attribution, partial failure, Thailand constraints, and stable marker sizing.

## 0.2.0 — 2026-08-26

### ภาษาไทย

- สร้าง map journey แบบ search → point → radius → analysis
- เพิ่ม optional area, arbitrary-point scoring, Nominatim search และ fallback map context
- แก้เส้น fallback ซ้อนและ Vite worker reload issue

### English

- Built the search → point → radius → analysis journey with optional area and arbitrary-point scoring.
- Added Nominatim, resilient fallback context, responsive controls, and worker/reload fixes.

## 0.1.0 — 2026-08-26

### ภาษาไทย

- สร้างต้นแบบ frontend-first: dashboard, map, scoring/recommendation, comparison, partners, branches, lifecycle, expansion, settings และ demo controls
- เพิ่ม local submission/photo preview, tests, Vercel/Sites builds และเอกสาร future API/PostGIS/security

### English

- Created the frontend-first prototype across dashboard, map, scoring, recommendation, comparison, partner/branch, lifecycle, expansion, settings, and demo controls.
- Added local prototype submission/photo preview, automated tests, dual deployment builds, and future API/PostGIS/security foundations.

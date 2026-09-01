# Changelog / บันทึกการเปลี่ยนแปลง

รูปแบบวันที่ใช้ ISO (`YYYY-MM-DD`) และอธิบายทั้งผลต่อผู้ใช้และผลทางเทคนิค

Dates use ISO format and entries describe user and technical impact.

## 0.9.9 — 2026-09-01

### ภาษาไทย

- แก้ Vercel รายงานว่าโหลดอาคารแล้วแต่ภาพยังดูแบน โดยรอเฟรมหลัง `GeoJSONSource.setData()` และนับเฉพาะอาคารที่วาดอยู่ใน viewport จริง
- เมื่อ same-origin building API ส่ง geometry สำเร็จ ระบบแสดง GeoJSON extrusion โดยตรงและซ่อน vector layer อีกแหล่ง จึงไม่มีการซ้อนกันหรือเลือก layer ผิดจาก race condition
- วางอาคาร 3D ใต้ label layer แบบเดียวกับ BTSMRT, เพิ่มความสูงขั้นต่ำของ fallback, ปรับกล้องเป็น zoom 15.5/pitch 55° เพื่อเก็บ footprint ใกล้สุดของ Photon ไว้ในกรอบ และไม่เปิด terrain ทับระหว่างรอ OpenFreeMap
- ตรึง MapLibre GL เป็น 5.12.0 ให้ตรงกับ BTSMRT หลังยืนยันว่า 6.6.0 โหลด GeoJSON/vector worker ได้ใน dev แต่ `sourceLoaded=false` ใน Next/Vercel production build

### English

- Fixed Vercel reporting loaded buildings while still looking flat by waiting for the post-`setData()` frame and counting only buildings actually rendered in the viewport.
- A successful same-origin building response now activates its GeoJSON extrusion directly and hides the alternate vector layer, removing the source-selection race without overlapping buildings.
- Buildings now sit below the first label layer like BTSMRT, fallback display heights are clearer, the camera uses zoom 15.5/pitch 55° to keep the nearest Photon footprints in view, and terrain is not enabled while OpenFreeMap is still loading.
- Pinned MapLibre GL to 5.12.0 to match BTSMRT after confirming that 6.6.0 loaded GeoJSON/vector workers in development but remained `sourceLoaded=false` in the Next/Vercel production build.

## 0.9.8 — 2026-09-01

### ภาษาไทย

- แก้โหมด 3D บน Vercel ไม่มีอาคารเมื่อ browser เรียก Overpass/Photon ข้ามโดเมนไม่สำเร็จ โดยเพิ่ม API อาคารภายในโดเมนเดียวกับเว็บ
- เริ่มโหลด OpenFreeMap vector และ OSM fallback พร้อมกันเมื่อกด 3D จึงไม่ต้องรอ timeout ก่อนเริ่มดึงรูปทรงอาคาร
- เลือกแสดง vector หรือ GeoJSON extrusion เพียงแหล่งเดียวตามแหล่งที่พร้อมใช้งาน โดยทั้งสองทางยังเป็น MapLibre 3D จริง

### English

- Fixed missing 3D buildings on Vercel when browser-side cross-origin Overpass/Photon requests were unavailable by adding a same-origin building API.
- OpenFreeMap vector tiles and the OSM fallback now start loading together when 3D mode is enabled instead of waiting for a timeout.
- The first usable vector or GeoJSON extrusion remains the sole visible building source, and both paths render as real MapLibre 3D geometry.

## 0.9.7 — 2026-09-01

### ภาษาไทย

- แก้อาคาร 3D ซ้อนกันโดยบังคับให้ OpenFreeMap vector และ OSM GeoJSON fallback แสดงผลได้ครั้งละหนึ่งแหล่งเท่านั้น
- ถอด footprint แบบแบนและบล็อกอาคาร HTML ที่เคยวางทับ canvas จนเห็นเป็นสี่เหลี่ยมบน Vercel ออก
- ใช้ MapLibre `fill-extrusion` ทั้งแหล่งหลักและ fallback พร้อมพัก terrain/hillshade ขณะแสดงอาคาร เพื่อให้ local และ production แสดงผลสอดคล้องกัน

### English

- Prevented overlapping 3D buildings by making the OpenFreeMap vector and OSM GeoJSON fallback layers mutually exclusive.
- Removed the flat footprint and HTML building blocks that appeared as rectangles above the Vercel canvas.
- Both primary and fallback buildings now use MapLibre `fill-extrusion`, with terrain/hillshade paused while buildings are visible for consistent local and production rendering.

## 0.9.6 — 2026-08-31

### ภาษาไทย

- แก้อาคารรอบจุดที่เลือกโหลดสำเร็จแต่ไม่ปรากฏ เพราะ raster terrain/hillshade บังฐานอาคาร GeoJSON ใน depth buffer
- เมื่อมีข้อมูลอาคาร ระบบใช้โหมดอาคารเมือง 3D ที่ให้ความสำคัญกับ extrusion ที่มองเห็นได้ และกลับไปใช้ภูมิประเทศ 3D อัตโนมัติเมื่อบริเวณนั้นไม่มีรูปทรงอาคาร
- ป้องกัน event สถานะแผนที่เขียนทับผลโหลดอาคาร โดยเก็บจำนวนอาคารล่าสุดแยกจากจำนวน feature ที่กล้องกำลังมองเห็น
- เพิ่มชั้น footprint สีฟ้าและความสูงขั้นต่ำเพื่อให้ geometry ที่เป็นค่าประมาณจากผู้ให้บริการ fallback มองเห็นได้ชัดเจนบน Vercel โดยอาคารที่เลือกจะสูงและเด่นกว่า พร้อมคงป้ายกำกับว่าเป็นค่าประมาณ
- เพิ่มชั้นบล็อกอาคาร OSM แบบจำกัดจำนวนเหนือ canvas เป็น visual fallback สำหรับ browser/WebGL ที่รับข้อมูลแล้วไม่วาด extrusion โดยยังคงยึดพิกัดอาคารจริงและระบุว่าเป็นค่าประมาณ

### English

- Fixed selected-area buildings loading successfully but remaining invisible because raster terrain/hillshade depth-occluded the GeoJSON building bases.
- Urban 3D now prioritizes visible building extrusions when geometry is available and automatically restores nationwide terrain when no building geometry is available.
- Prevented asynchronous map events from overwriting building-ready state by tracking the latest loaded building count independently from currently rendered features.
- Added a blue footprint layer and minimum display heights so fallback geometry remains legible on Vercel; the selected building is intentionally more prominent and all estimated geometry remains labeled as estimated.
- Added bounded OSM building blocks above the canvas as a visual fallback for browser/WebGL combinations that receive data but do not paint extrusions; they remain geographically anchored and are explicitly estimated.

## 0.9.5 — 2026-08-31

### ภาษาไทย

- แก้สัญลักษณ์ EV สถานีคู่แข่ง ปั๊มน้ำมัน และ POI รอบพื้นที่วิเคราะห์ไม่ปรากฏ โดยเปลี่ยนเป็น native MapLibre DOM marker ที่ใช้ SVG pictogram และอยู่เหนือชั้นแผนที่ 2D/3D
- เพิ่ม screen-grid clustering เพื่อลดการทับกันเมื่อซูมออก โดยไอคอนและกลุ่มมีขนาดคงที่บนหน้าจอ และกดกลุ่มเพื่อซูมเข้าได้
- แสดงสถานะ `รอโหลด` ก่อนกดวิเคราะห์และจำนวนรายการจริงหลังวิเคราะห์ในแผงชั้นข้อมูล
- เพิ่ม fallback จาก Overpass ไปยัง Photon OSM แบบ bounded queries พร้อม timeout และ result limit เพื่อให้ยังค้นหาสถานที่จริงได้เมื่อ shared Overpass ไม่พร้อม

- แก้โหมด 3D ที่เอียงกล้องแต่ไม่แสดงอาคาร โดยเพิ่ม bounded Overpass building-footprint fallback รอบจุดที่เลือก และสร้าง extrusion จากรูปทรงอาคาร OpenStreetMap จริง
- เน้นอาคารที่หมุดอยู่ภายในหรืออาคารใกล้ที่สุดด้วยสีฟ้า พร้อมใช้ `height` ก่อน ประมาณจาก `building:levels` เมื่อจำเป็น และใช้ Photon building extent เมื่อ Overpass ไม่มี footprint โดยระบุรูปทรง/ความสูงที่ขาดว่าเป็นค่าประมาณ

### English

- Fixed 3D mode tilting the camera without showing buildings by adding a bounded Overpass building-footprint fallback around the selected point and extruding real OpenStreetMap geometry.
- The containing or nearest building is highlighted in cyan. Tagged `height` is preferred, `building:levels` supplies an explainable estimate, and Photon building extents are used when Overpass has no footprint. Missing shapes/heights are labeled estimated.
- Fixed missing EV, competitor, fuel-station, and POI symbols around the analysis area by rendering native MapLibre DOM markers with SVG pictograms above both 2D and 3D layers.
- Added screen-grid clustering to prevent overlap at overview zooms. Markers and clusters retain a fixed screen size, and clusters can be clicked to zoom in.
- Layer controls now show `Pending` before explicit analysis and real result counts afterward.
- Added bounded failover from Overpass to Photon OSM with timeouts and result limits, keeping real nearby-place lookup available when shared Overpass is unavailable.

## 0.9.4 — 2026-08-31

### ภาษาไทย

- ถอดหมุด WebGL เดิมที่ซ้ำกับ native MapLibre marker ออก ให้เหลือหมุดตำแหน่งที่เลือกเพียงหนึ่งอัน
- เปลี่ยนวงรัศมีเป็น SVG overlay ที่ฉาย polygon ระยะจริงผ่าน MapLibre พร้อมพื้นสีน้ำเงินและเส้นขอบสองชั้นสีขาว/น้ำเงิน เพื่อไม่ขึ้นกับ WebGL layer ของ basemap

### English

- Removed the legacy WebGL selected-point symbol so exactly one native MapLibre selection marker remains.
- Replaced the unreliable WebGL radius layer with an SVG overlay that projects the geodesic polygon through MapLibre, using a blue fill and high-contrast white/blue double outline.

## 0.9.3 — 2026-08-31

### ภาษาไทย

- เพิ่มหมุด MapLibre แบบยึดกับพิกัดจริงเหนือ canvas เพื่อให้เห็นชัดใน 2D/3D และมีขนาดคงที่เมื่อซูม
- แก้หมุดและวงรัศมีบน Vercel ไม่อัปเดตหลังเลือกพิกัด เพราะเดิมรอ `map.isStyleLoaded()` ซึ่งอาจเป็น false ระหว่าง raster tile ยังโหลด
- เปลี่ยนการสร้าง custom source/layer ไปใช้ `style.load` และอัปเดต GeoJSON source โดยตรวจ source ที่ต้องใช้โดยตรง
- เปิดปุ่มควบคุมแผนที่หลัง layer ของหมุดพร้อมจริง และเพิ่ม test ครอบคลุมการอัปเดตหมุดแม้ tile ภายนอกยังไม่พร้อม

### English

- Added a coordinate-anchored native MapLibre marker above the canvas for reliable 2D/3D visibility and fixed on-screen size while zooming.
- Fixed selected pins and radius polygons failing to update on Vercel because updates were gated by `map.isStyleLoaded()` while raster tiles were still loading.
- Initialized custom sources and layers on `style.load` and now update writable GeoJSON sources directly.
- Enabled map actions only after the selected-point layer is ready and added coverage for selection updates while external tiles remain pending.

## 0.9.2 — 2026-08-31

### ภาษาไทย

- แก้สาเหตุ Vercel บล็อก deployment ก่อน build โดยเปลี่ยน Git author ของ commit ใหม่จาก placeholder เป็นบัญชี GitHub ที่ยืนยันแล้ว
- เพิ่มคู่มือตรวจและแก้ `Deployment Blocked` ที่ไม่มี build log พร้อมย้ำว่าต้องสร้าง commit ใหม่หลังเปลี่ยน Git configuration

### English

- Resolved Vercel's pre-build deployment block by using a GitHub-verified author identity for the new commit instead of a placeholder email.
- Documented how to diagnose and recover from `Deployment Blocked` with no build log, including the requirement to create a new commit after changing Git configuration.

## 0.9.1 — 2026-08-31

### ภาษาไทย

- แก้หมุดวิเคราะห์ให้ยึดกับพิกัดจริงบน MapLibre และไม่ดูเหมือนลอยตามกึ่งกลางหน้าจอ
- การคลิกแผนที่จะวางหมุดตรงตำแหน่งที่คลิกโดยไม่เลื่อนกล้องอัตโนมัติ ส่วนการเลือกผลค้นหายังคงพากล้องไปยังสถานที่ที่ค้นพบ
- นำ fallback overlay รวมทั้งหมุด วงรัศมี และสัญลักษณ์จำลองแบบ HTML ที่ตรึงกับหน้าจอออกทั้งหมด โดยใช้ background layer ของ MapLibre ระหว่างโหลด
- เพิ่มการทดสอบกฎการเคลื่อนกล้องและตรวจว่า fallback ไม่มีหมุดจำลอง

### English

- Anchored the active analysis marker exclusively to its MapLibre geographic coordinate so it no longer appears fixed to the viewport center.
- Direct map clicks now keep the camera stable and place the pin exactly where clicked; search-result selection still recenters to reveal an off-screen result.
- Removed the entire startup fallback overlay, including screen-fixed HTML marker, radius, and entity simulations; MapLibre's own background layer now handles startup rendering.
- Added automated coverage for camera-selection rules and the absence of fallback marker simulations.

## 0.9.0 — 2026-08-31

### ภาษาไทย

- เพิ่ม security headers ที่ SecurityHeaders.com ตรวจครบ: CSP, HSTS, `nosniff`, anti-framing, Referrer Policy และ Permissions Policy พร้อม headers ป้องกันเพิ่มเติม
- ใช้ CSP แบบ nonce ใหม่ทุก page request และตัด `unsafe-inline`/`unsafe-eval` ออกจาก production `script-src`
- รักษาการเชื่อมต่อ MapLibre และ API provider ที่เปลี่ยน endpoint ได้ โดยอนุญาต HTTPS data/image connection แต่ไม่อนุญาต external script
- เพิ่ม automated tests และคู่มือตรวจหลัง deploy พร้อมอธิบายข้อจำกัดของ owner-only hosting gateway

### English

- Added the complete SecurityHeaders-checked set: CSP, HSTS, MIME-sniffing protection, anti-framing, Referrer Policy, and Permissions Policy, plus defense-in-depth headers.
- Added a fresh nonce per page request and removed `unsafe-inline`/`unsafe-eval` from production `script-src`.
- Preserved MapLibre and replaceable provider endpoints through HTTPS data/image connections without permitting external scripts.
- Added automated coverage and deployment verification guidance, including the owner-only hosting-gateway limitation.

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

# UI Flow and UX Rules / ขั้นตอนหน้าจอและกฎ UX

## ภาษาไทย

### หลักการออกแบบ

UI เป็น enterprise GIS dashboard ที่ให้ความสำคัญกับความชัดเจนมากกว่าการตกแต่ง ผู้ใช้ควรเห็น action ถัดไปได้โดยไม่ต้องรู้คำศัพท์เทคนิค แผนที่เป็นพื้นที่ทำงานหลัก แต่ผลคะแนนต้องอธิบายได้และไม่บังพื้นที่แผนที่โดยไม่จำเป็น

### โครงสร้างหน้าจอ

- `/` หน้าเริ่มต้นและคำแนะนำ 3 ขั้นตอน
- `/map` ค้นหา เลือกจุด รัศมี ชั้นข้อมูล 2D/3D และผลวิเคราะห์
- `/sites` รายการพื้นที่จาก Company API
- `/sites/[id]` Site Intelligence พร้อม score, recommendation และ provenance
- `/compare` เปรียบเทียบพื้นที่
- `/partners`, `/partners/[id]` พันธมิตรและสาขาที่เกี่ยวข้อง
- `/branches` การจัดอันดับสาขา
- `/opportunities` lifecycle ของโอกาส
- `/expansion` ภาพรวมแผนการขยาย
- `/analysis` อธิบายน้ำหนัก เกณฑ์ และประเภทสถานี
- `/settings` ภาษา theme และ API connections
- `/demo` Demo Role และ failure simulation

### Map workspace

Desktop ใช้สามส่วน: controls, map และ result panel ผู้ใช้เลือกจุดทางซ้าย ดูพื้นที่ตรงกลาง และอ่านผลด้านขวา Tablet อาจ overlay result อย่างกะทัดรัด Mobile เรียง controls → map → result

แผงชั้นข้อมูลแสดงทุก category และไอคอนเสมอ ส่วน legend บนแผนที่พับเป็นปุ่มเล็กโดยค่าเริ่มต้น ป้าย “ขอบเขตประเทศไทย” และคำสั่งคลิกถูกนำออกเพื่อลดสิ่งรบกวน ปุ่ม 3D/2D และ recenter เป็น icon-only พร้อม `aria-label` และ tooltip

### Navigation และ responsive

- Desktop sidebar ย่อเป็น icon rail ได้และจำ preference บนอุปกรณ์
- Mobile ใช้ปุ่ม menu เพียงปุ่มเดียวและเปลี่ยนเป็น close เมื่อ drawer เปิด
- หน้า active ใช้ `aria-current="page"` และไม่เน้น Map Explorer ถาวร
- Touch target สำคัญต้องใช้ง่ายแม้ visual button มีขนาดกะทัดรัด
- ตารางต้อง scroll ได้และ form เรียงเป็นคอลัมน์เดียวเมื่อพื้นที่แคบ

### ภาษา ตัวอักษร และ theme

ครั้งแรกใช้ภาษาไทยและโหมดสว่าง ผู้ใช้เปลี่ยนไทย/อังกฤษและ light/dark/system ได้ ค่า `lang` ของ document เปลี่ยนตามภาษา ใช้ Noto Sans Thai และ Noto Sans ที่ bundle มากับแอปเพื่อลด font dependency ภายนอก

### Score และ data quality

- Overall score แสดง `/100` เมื่อมีการวิเคราะห์จริง
- Factor bar ใช้สี ไอคอน/ข้อความ และเส้นอ้างอิงโดยไม่พึ่งสีอย่างเดียว
- Flood score คือ safety score; label ต้องลดความเข้าใจผิด
- Verified และ Estimated มี visual treatment ต่างกัน
- Unknown ไม่ใช้ `0` แทนโดยอัตโนมัติถ้า 0 มีความหมายทางธุรกิจ

### Accessibility

ใช้ semantic heading, label ที่เชื่อม input, focus-visible, keyboard navigation, accessible dialog, status message และ alternative text ปุ่มไอคอนทุกตัวต้องมีชื่อที่โปรแกรมอ่านหน้าจอเข้าใจ Map canvas มี accessible label แต่การวิเคราะห์หลักต้องทำผ่าน form/control ที่เข้าถึงได้โดยไม่พึ่ง gesture อย่างเดียว

---

## English

### Design principles

The UI is an enterprise GIS dashboard that prioritizes clarity over decoration. Users should recognize the next action without technical vocabulary. The map is the main workspace, while scores remain explainable and overlays avoid obstructing useful geography.

### Route structure

The routes listed above cover start, map analysis, company sites, site intelligence, comparison, partners, branches, opportunities, expansion, scoring explanation, settings, and demo simulation.

### Map workspace

Desktop uses controls, map, and result columns. Tablet may overlay a compact result panel. Mobile orders controls → map → result. Layer controls always expose all categories. The map legend is collapsed by default. Redundant country and click-instruction badges are removed. 3D/2D and recenter actions are compact icon-only controls with accessible names and titles.

### Navigation and responsive behavior

- Desktop navigation collapses to an icon rail and remembers the device-local preference.
- Mobile uses one menu control that becomes a close action while open.
- Only the current route receives active treatment and `aria-current="page"`.
- Important touch targets remain usable even when visual controls are compact.
- Tables scroll and forms collapse to one column on narrow screens.

### Language, typography, and theme

First-run defaults are Thai and light mode. Users can select Thai/English and light/dark/system. Document `lang` follows the selected language. Bundled Noto Sans Thai and Noto Sans avoid an external font dependency.

### Score and data quality

- Overall score displays `/100` only after actual analysis.
- Factor bars use more than color and include reference markers.
- Flood score is a safety score and labels should prevent misinterpretation.
- Verified and Estimated data receive distinct treatment.
- Unknown values are not silently represented as zero when zero has business meaning.

### Accessibility

Use semantic headings, associated form labels, visible focus, keyboard navigation, accessible dialogs, status messages, and meaningful alternative text. Every icon-only action has an accessible name. The map canvas has an accessible label, and critical analysis actions remain available through form controls rather than gesture alone.

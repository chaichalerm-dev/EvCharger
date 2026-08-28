# EV Location & Expansion Intelligence Platform

แพลตฟอร์มวิเคราะห์ทำเลและสนับสนุนการตัดสินใจขยายโครงสร้างพื้นฐานสถานีชาร์จรถยนต์ไฟฟ้าในประเทศไทย

A location intelligence and decision-support platform for EV charging infrastructure expansion in Thailand.

> **สถานะ / Status:** Functional prototype · Frontend-first · Backend-ready · Database-ready
>
> ข้อมูลจากผู้ให้บริการสาธารณะไม่ใช่ข้อมูลตรวจสอบภาคสนามและไม่รับประกันว่าเป็นข้อมูลเวลาจริง
>
> Public-provider data is not field-verified and is not guaranteed to be real-time.

## ภาษาไทย

### 1. โปรเจกต์นี้ทำอะไร

ระบบช่วยตอบคำถามทางธุรกิจว่า **“ควรขยายสถานีชาร์จ EV ที่ไหน และเพราะอะไร”** ผู้ใช้สามารถค้นหาสถานที่ในประเทศไทย คลิกเลือกจุดบนแผนที่ กำหนดรัศมี 1, 3, 5 หรือ 10 กิโลเมตร ระบุพื้นที่ว่างโดยประมาณ แล้วเรียกวิเคราะห์บริบทรอบพื้นที่จากผู้ให้บริการข้อมูลที่ตั้งค่าไว้

ผลลัพธ์ประกอบด้วยข้อมูลสถานี EV ปั๊มน้ำมัน คู่แข่ง จุดสนใจ ประชากร สภาพอากาศ ความสูง บริบทการไหลของแม่น้ำ การจราจรเมื่อมี TomTom key คะแนนรายปัจจัย คำแนะนำ เหตุผล ความเสี่ยง และข้อมูลที่ยังต้องสำรวจพื้นที่จริง ระบบไม่เปลี่ยนข้อมูลที่ไม่ทราบให้กลายเป็นข้อเท็จจริง

### 2. ความสามารถที่ใช้งานได้ในต้นแบบ

- หน้าเริ่มต้นแบบแนะนำขั้นตอนสำหรับผู้ใช้ทั่วไป
- MapLibre สำหรับค้นหา คลิกเลือกจุด วาดรัศมี เปิด/ปิดชั้นข้อมูล clustering และ popup
- แผนที่ 3D ด้วย Mapterhorn terrain และอาคารจาก OpenFreeMap เมื่อพื้นที่นั้นมีข้อมูลอาคาร OpenStreetMap ที่เหมาะสม
- ปุ่มควบคุมแผนที่แบบกะทัดรัด ป้ายสัญลักษณ์แบบพับได้ และไอคอนที่ไม่ขยายจนบังพื้นที่เมื่อซูมออก
- เครื่องมือวิเคราะห์และให้คะแนนแบบ deterministic พร้อมคำอธิบายทางธุรกิจ
- หน้ารายการพื้นที่ เปรียบเทียบ พันธมิตร สาขา โอกาส และแดชบอร์ดการขยายสำหรับเชื่อม Company Business API ในอนาคต
- แบบฟอร์มส่งพื้นที่พันธมิตรที่บันทึกเฉพาะบนอุปกรณ์ในโหมดต้นแบบ
- Demo Role สำหรับสาธิต UX ของสิทธิ์ ไม่ใช่ระบบยืนยันตัวตนจริง
- ภาษาไทย/อังกฤษ โหมดสว่าง/มืด/ตามระบบ และ Noto Sans Thai/Noto Sans
- Demo Controls สำหรับจำลองข้อมูลว่าง ความล่าช้า และความล้มเหลว
- การทดสอบด้วย Vitest, React Testing Library และ Playwright

### 3. โหมดข้อมูลปัจจุบัน

Runtime ใช้ **Real Provider Mode** และไม่เติมข้อมูลตลาดจำลองลงในแดชบอร์ด แผนที่ พื้นที่ พันธมิตร สาขา การเปรียบเทียบ หรือโอกาสโดยอัตโนมัติ ข้อมูลบริบทสาธารณะจะถูกเรียกเมื่อผู้ใช้กดวิเคราะห์เท่านั้น ส่วนหน้าข้อมูลบริษัทจะแสดง empty/error state อย่างตรงไปตรงมาจนกว่าจะตั้งค่า Company Business REST API

ผู้ให้บริการที่รองรับได้แก่ OpenStreetMap raster tiles, OpenFreeMap, Mapterhorn, Nominatim, Overpass, Open-Meteo, WorldPop, TomTom และ Company Business REST API รายละเอียดข้อจำกัดอยู่ใน [Data Sources](docs/DATA-SOURCES.md)

### 4. เริ่มใช้งาน

ต้องใช้ Node.js 22.13 หรือใหม่กว่า

```bash
npm install
npm run dev
```

เปิด `http://localhost:3000` แล้วทำตามขั้นตอน:

1. เข้า `/map`
2. ค้นหาสถานที่ในประเทศไทยหรือคลิกบนแผนที่
3. เลือกรัศมีและระบุพื้นที่ว่างถ้ามี
4. กด **วิเคราะห์พื้นที่นี้**
5. อ่านคะแนน คำแนะนำ เหตุผล ความเสี่ยง และข้อมูลที่ต้องสำรวจเพิ่ม
6. เข้า `/settings#api-connections` เมื่อต้องการเปิด/ปิด provider หรือกรอก token ที่ผู้ให้บริการอนุญาตให้ใช้ใน browser

### 5. คำสั่งตรวจสอบ

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run build:vercel
```

`npm run build` ตรวจเป้าหมาย Vinext/Sites และ `npm run build:vercel` ตรวจ Next.js สำหรับ Vercel

### 6. ความปลอดภัยของ API token

Token ที่กรอกใน Settings อยู่ในหน่วยความจำ JavaScript ของหน้าเว็บเท่านั้นและหายเมื่อ refresh ระบบไม่บันทึก token ลง localStorage, source code, Git หรือไฟล์ deploy วิธีนี้ลดความเสี่ยงของต้นแบบแต่ไม่ได้ทำให้ browser key เป็นความลับ ระบบ production ต้องมี backend/BFF, secure session, secret manager, provider restriction, rotation และ audit

### 7. สถาปัตยกรรมโดยย่อ

```text
ปัจจุบัน
Browser → Next.js UI → Services/Hooks → Provider/Repository contracts
        → Public APIs หรือ Company Business REST API
        → Local browser repository เฉพาะข้อมูลต้นแบบที่ระบุชัด

อนาคต
Browser → Next.js → REST API → NestJS/Go
        → PostgreSQL + PostGIS → Cache/Queue/External providers
```

อ่านต่อที่ [Architecture](docs/ARCHITECTURE.md), [Future Backend](docs/FUTURE-BACKEND.md), [Future Database](docs/FUTURE-DATABASE.md) และ [PostGIS](docs/POSTGIS.md)

### 8. ข้อจำกัดสำคัญ

- ต้นแบบนี้ไม่ใช่ระบบ production authentication หรือ production authorization
- ข้อมูลสาธารณะอาจช้า ไม่พร้อมใช้งาน มี quota หรือเปลี่ยนเงื่อนไขได้
- 3D terrain ครอบคลุมกว้าง แต่อาคาร 3D ขึ้นกับคุณภาพข้อมูลอาคารใน OpenStreetMap
- ข้อมูลน้ำท่วมเป็นบริบทจากโมเดลการไหลของแม่น้ำ ไม่ใช่ผลยืนยันระดับแปลง
- ความพร้อมไฟฟ้า หม้อแปลง ทางเข้าออก กรรมสิทธิ์ และเงื่อนไขพาณิชย์ต้องสำรวจและยืนยัน
- คะแนนและแบบจำลองการเงินเป็นเครื่องมือคัดกรอง ไม่ใช่คำรับรองความเป็นไปได้หรือผลตอบแทน

ดูรายการเต็มที่ [Limitations](docs/LIMITATIONS.md) และ [Security](docs/SECURITY.md)

---

## English

### 1. What this project does

The platform helps answer **“Where should the company expand EV charging infrastructure, and why?”** A user can search within Thailand, click a map location, select a 1, 3, 5, or 10 km radius, optionally enter available site area, and request contextual analysis from configured providers.

The result can include nearby EV stations, fuel stations, competitors, POIs, population, weather, elevation, river-discharge context, traffic when a TomTom key is available, factor scores, a recommendation, reasons, risks, and survey gaps. Unknown facts are never converted into positive claims.

### 2. Prototype capabilities

- Guided start page for non-technical users
- MapLibre search, click selection, radius polygons, layer controls, clustering, and popups
- Mapterhorn terrain plus OpenFreeMap building extrusions where usable OpenStreetMap building data exists
- Compact map actions, collapsible legend, and zoom-aware symbols that do not grow over the map when zooming out
- Deterministic scoring and explainable business recommendations
- Sites, comparison, partners, branches, opportunities, and expansion views prepared for a Company Business API
- Partner site submission with clearly labelled device-local prototype persistence
- Demo Role for permission UX only; it is not authentication
- Thai/English, light/dark/system themes, and bundled Noto Sans fonts
- Failure, empty-data, and slow-loading simulations
- Vitest, React Testing Library, and Playwright coverage

### 3. Current data mode

Runtime screens operate in **Real Provider Mode**. They do not automatically inject bundled market fixtures into dashboard, map, site, partner, branch, comparison, or opportunity flows. Public context is requested only after user action. Company portfolio screens show honest empty or error states until a Company Business REST API is configured.

Supported provider boundaries include OpenStreetMap raster tiles, OpenFreeMap, Mapterhorn, Nominatim, Overpass, Open-Meteo, WorldPop, TomTom, and a Company Business REST API. See [Data Sources](docs/DATA-SOURCES.md) for constraints.

### 4. Getting started

Node.js 22.13 or later is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, then:

1. Go to `/map`.
2. Search for a location in Thailand or click the map.
3. Select a radius and optionally enter available area.
4. Press **Analyze this area**.
5. Review the score, recommendation, rationale, risks, and required survey items.
6. Use `/settings#api-connections` to enable providers or enter provider-approved browser/client tokens.

### 5. Validation commands

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run build:vercel
```

`npm run build` validates the Vinext/Sites target. `npm run build:vercel` validates the Next.js Vercel target.

### 6. API-token safety

Tokens entered in Settings remain only in the active page's JavaScript memory and are cleared by refresh. They are not written to localStorage, source code, Git, or deployed files. This is a prototype risk reduction, not secret protection. Production requires a backend/BFF, secure sessions, a secret manager, provider restrictions, rotation, and audit logging.

### 7. Architecture summary

```text
Current
Browser → Next.js UI → Services/Hooks → Provider/Repository contracts
        → Public APIs or Company Business REST API
        → Local browser repository only for explicitly labelled prototype data

Future
Browser → Next.js → REST API → NestJS/Go
        → PostgreSQL + PostGIS → Cache/Queue/External providers
```

Continue with [Architecture](docs/ARCHITECTURE.md), [Future Backend](docs/FUTURE-BACKEND.md), [Future Database](docs/FUTURE-DATABASE.md), and [PostGIS](docs/POSTGIS.md).

### 8. Important limitations

- This prototype does not provide production authentication or authorization.
- Public providers may be slow, unavailable, quota-limited, or subject to changing terms.
- Terrain has broad coverage; 3D buildings depend on OpenStreetMap building quality.
- Flood information is river-model context, not parcel-level verification.
- Power capacity, transformer access, entrances, ownership, and commercial terms require survey and verification.
- Scores and financial simulations are screening aids, not feasibility or return guarantees.

See [Limitations](docs/LIMITATIONS.md) and [Security](docs/SECURITY.md).

## Documentation index / สารบัญเอกสาร

- [AI Development Guide / คู่มือ AI](AI.md)
- [Architecture / สถาปัตยกรรม](docs/ARCHITECTURE.md)
- [Product Flow / ขั้นตอนผลิตภัณฑ์](docs/PRODUCT-FLOW.md)
- [UI Flow / ขั้นตอนหน้าจอ](docs/UI-FLOW.md)
- [Map / แผนที่](docs/MAP.md)
- [Data Model / แบบจำลองข้อมูล](docs/DATA-MODEL.md)
- [Data Sources / แหล่งข้อมูล](docs/DATA-SOURCES.md)
- [Scoring / การให้คะแนน](docs/SCORING.md)
- [Business Logic / ตรรกะธุรกิจ](docs/BUSINESS-LOGIC.md)
- [Security / ความปลอดภัย](docs/SECURITY.md)
- [Deployment / การเผยแพร่](docs/DEPLOYMENT.md)
- [Testing / การทดสอบ](docs/TESTING.md)
- [Troubleshooting / การแก้ปัญหา](docs/TROUBLESHOOTING.md)
- [Handoff / การส่งมอบ](docs/HANDOFF.md)
- [ADRs / บันทึกการตัดสินใจ](docs/adr/)

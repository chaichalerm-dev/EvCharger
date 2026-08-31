# Data Sources and Provider Strategy / แหล่งข้อมูลและกลยุทธ์ผู้ให้บริการ

## ภาษาไทย

### หลักการ

Runtime ใช้ Real Provider Mode ข้อมูล public observation ถูกเรียกเมื่อผู้ใช้กดวิเคราะห์เท่านั้นและไม่รับประกัน real-time, completeness หรือ field verification ข้อมูลบริษัทไม่ถูกสร้างจำลองเมื่อ Business API ไม่พร้อม

ทุก provider ควรมี metadata: ชื่อ provider, endpoint, license/terms, coverage, วิธีเก็บ, collectedAt, lastUpdated, confidence, verifiedStatus, cache age และ error state Production ingestion ต้องเก็บ raw snapshot ที่ตรวจสอบย้อนกลับได้และทำ sync แบบ idempotent

ระบบใช้ Overpass endpoint ที่ผู้ใช้ตั้งค่าเป็นลำดับแรก หากไม่พร้อมจึงใช้ Photon `/reverse` แบบ bounded radius สำหรับสถานีชาร์จ ปั๊มน้ำมัน และกลุ่ม `amenity`, `shop`, `tourism` ระบบใช้ timeout, result limit และ memory cache เพื่อลดภาระ ทั้งสองบริการเป็น shared community/demo infrastructure ไม่มี production SLA

### Provider ที่เชื่อมต่อ

| Provider | ใช้ทำอะไรในต้นแบบ | Token | ข้อจำกัดสำคัญ |
| --- | --- | --- | --- |
| OpenStreetMap raster tiles | แผนที่ถนนฐาน | ไม่ต้องใช้ | ต้อง attribution; public tile ไม่มี SLA |
| Mapterhorn | terrain DEM และ hillshade 3D | ไม่ต้องใช้ | ความละเอียด terrain โดยประมาณ; ไม่ใช่อาคาร |
| OpenFreeMap | vector building สำหรับ extrusion 3D | ไม่ต้องใช้ | coverage/height ขึ้นกับข้อมูล OpenStreetMap |
| Nominatim | ค้นหาสถานที่ในประเทศไทยเมื่อผู้ใช้สั่ง | ไม่ต้องใช้ | public policy จำกัดรูปแบบและอัตราใช้งาน; ไม่ใช้เป็น autocomplete ต่อเนื่อง |
| Overpass API | EV, fuel และ POI รอบรัศมี | ไม่ต้องใช้ | shared capacity ไม่มี SLA; ใช้ configured endpoint แบบมี timeout และ result limit |
| Photon | OSM amenity/shop/tourism สำรองเมื่อ Overpass ไม่พร้อม | ไม่ต้องใช้ | demo service แบบ reasonable use ไม่มี SLA; bounded manual queries เท่านั้น |
| Open-Meteo Forecast | weather context | ไม่ต้องใช้สำหรับ public tier ที่รองรับ | ไม่ใช่ข้อมูลรับรองพื้นที่ |
| Open-Meteo Elevation | elevation โดยประมาณ | ไม่ต้องใช้ | resolution จำกัด; ไม่ใช้แทน survey |
| Open-Meteo Flood | river-discharge model context | ไม่ต้องใช้ | ไม่ใช่ parcel flood map/certification |
| WorldPop | population/density ภายใน polygon | key อาจเพิ่ม quota ตามแผน | async task; coverage/year และ quota เปลี่ยนได้ |
| TomTom Traffic Flow | current/free-flow speed ของถนนใกล้เคียง | ต้องใช้ API key | quota, license และ field availability ตาม account plan |
| Company Business REST API | sites, partners, branches, opportunities | customer endpoint และอาจใช้ bearer token | ต้องมี CORS หรือ backend proxy; ไม่มี public substitute |

### Runtime API Settings

หน้า Settings อนุญาตเปลี่ยน endpoint และ token ที่เหมาะกับ browser/client โดยไม่แก้โค้ด ค่าอยู่ใน memory และหายเมื่อ refresh Endpoint ต้องเป็น HTTPS หรือ localhost HTTP ตาม validation ห้ามกรอก production secret ที่ไม่อนุญาตให้เปิดเผยใน browser

### Data quality

- `VERIFIED`: ผ่านกระบวนการยืนยันที่กำหนดและยังไม่หมดอายุ
- `ESTIMATED`: คำนวณหรืออนุมานจากข้อมูลที่มี
- `APPROXIMATE`: ความละเอียด/วิธีเก็บไม่เหมาะกับความแม่นยำระดับแปลง
- `UNVERIFIED`: ยังไม่มีหลักฐานยืนยัน
- `EXPIRED`: เกินอายุข้อมูลที่ยอมรับ

Confidence บอกความเชื่อมั่นต่อ observation แต่ไม่แทน verification status ตัวอย่าง: model ที่สม่ำเสมออาจมี confidence medium แต่ยังเป็น approximate

### Cache, quota และ health

Prototype ใช้ browser-memory cache และ bounded timeout เพื่อลดการเรียกซ้ำ Production ควรใช้ server-side cache ตาม license, quota telemetry, remaining/renewal visibility เมื่อ provider มี API, retry/backoff, circuit breaker, health dashboard และ fallback provider การใส่ key ใหม่ไม่ควรต้อง rebuild frontend

### Licensing และ privacy

ก่อน commercial launch ต้องตรวจ terms, attribution, redistribution, derived-data rights, rate limits, SLA, CORS และ geographic coverage ใหม่ทุก provider พิกัดและ polygon ที่ผู้ใช้เลือกอาจถูกส่งให้ provider เมื่อกดวิเคราะห์ จึงต้องมี privacy notice และ data minimization ที่เหมาะสม

### อาคาร 3D จากข้อมูล OSM

OpenFreeMap building tiles เป็นชั้นแรก และ bounded Overpass query สำหรับ `way["building"]` ภายใน 700 เมตรรอบหมุดเป็น fallback โดยจำกัด 450 อาคาร รูปทรงเป็นข้อมูล OSM จริง ค่า `height` ใช้เมื่อมี tag; หากไม่มีจะประมาณจาก `building:levels` หรือใช้ความสูงแสดงผลเริ่มต้น 6.2 เมตร อาคารที่ครอบหมุดหรือใกล้ที่สุดภายใน 120 เมตรจะถูกเน้นสี การแสดงผลนี้ไม่ใช่ผลสำรวจความสูงอาคาร

---

## English

### Principles

Runtime operates in Real Provider Mode. Public observations are requested only after explicit analysis and are not guaranteed real-time, complete, or field-verified. Company data is not fabricated when the Business API is unavailable.

Each provider should carry provider name, endpoint, terms, coverage, collection method, timestamps, confidence, verification, cache age, and error state. Production ingestion retains auditable raw snapshots and runs idempotent synchronization.

The client first uses the configured Overpass endpoint. If it fails, bounded Photon `/reverse` queries request charging stations, fuel stations, and nearby OSM `amenity`, `shop`, and `tourism` records. Timeouts, result limits, and memory caching keep use modest. Both are shared community/demo services without a production SLA.

For 3D mode, OpenFreeMap building tiles remain the first layer and a bounded Overpass `way["building"]` query within 700 metres of the selected pin provides a fallback, capped at 450 buildings. Footprints are real OSM geometry. Tagged `height` is preferred; otherwise `building:levels` or a 6.2-metre display default supplies an explicitly estimated extrusion. The containing or nearest building within 120 metres is highlighted. This visualization is not a building-height survey.

### Connected providers

The table above documents current basemap, terrain, vector building, geocoding, nearby-place, weather, elevation, flood-context, population, traffic, and company-data boundaries. Provider quotas and terms can change; verify official policies before release.

### Runtime API Settings

Settings can replace endpoints and eligible browser/client tokens without a code edit. Values remain in memory and clear on refresh. Endpoint validation permits HTTPS and localhost HTTP. Never enter a production secret that the provider does not authorize for browser exposure.

### Data quality

Verification status distinguishes VERIFIED, ESTIMATED, APPROXIMATE, UNVERIFIED, and EXPIRED. Confidence expresses belief in an observation but does not replace verification. A consistent model output may still be approximate at parcel scale.

### Cache, quota, and health

The prototype uses browser-memory caching and bounded timeouts. Production adds license-aware server caching, quota telemetry, remaining/renewal visibility when exposed by the provider, retry/backoff, circuit breakers, health dashboards, and fallback providers. Rotating a key should not require a frontend rebuild.

### Licensing and privacy

Before commercial use, re-check terms, attribution, redistribution, derived-data rights, rate limits, SLA, CORS, and coverage. Selected coordinates and polygons may be sent to enabled providers after explicit analysis, requiring appropriate privacy notice and minimization.

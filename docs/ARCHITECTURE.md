# Architecture / สถาปัตยกรรม

## ภาษาไทย

### เป้าหมาย

สถาปัตยกรรมใช้หลัก **Frontend-First, Backend-Ready, Database-Ready** เพื่อให้ต้นแบบสาธิตและวิเคราะห์พื้นที่ได้ทันทีโดยไม่ต้องมี database หรือ backend ของบริษัท แต่ยังคงขอบเขตที่สามารถแทนด้วย REST API, PostgreSQL และ PostGIS ภายหลังโดยไม่เขียน feature UI ใหม่ทั้งหมด

### สถาปัตยกรรมปัจจุบัน

```text
Browser
  └─ Next.js App Router + React + TypeScript
      ├─ Feature UI
      ├─ Hooks / Query state
      ├─ Services: scoring, recommendation, validation, analysis
      ├─ Provider contracts and adapters
      │   ├─ Nominatim / Overpass / Open-Meteo / WorldPop / TomTom
      │   └─ Map tiles / terrain / building vectors
      ├─ Repository contracts
      │   ├─ Company Business REST API adapter
      │   ├─ Empty fallback repositories
      │   └─ Local browser repository for labelled prototype submissions
      └─ Browser memory for temporary provider configuration
```

MapLibre เป็น renderer สำหรับ GIS ส่วน feature component ไม่ควรรู้ URL ของ provider หรือตรรกะการให้คะแนน การวิเคราะห์ arbitrary location อยู่ใน service แบบ deterministic และประกอบบริบทจาก provider ที่ตอบกลับได้ ความล้มเหลวของ provider หนึ่งรายการไม่ควรทำให้ผลจาก provider อื่นหรือแผนที่ล่ม

### ขอบเขตของชั้นต่าง ๆ

| ชั้น | ความรับผิดชอบ | สิ่งที่ห้ามทำ |
| --- | --- | --- |
| Domain | model และศัพท์ธุรกิจที่ไม่ขึ้นกับ UI | import React, MapLibre, fetch หรือ database |
| Config | น้ำหนัก เกณฑ์ รัศมี ประเภทสถานี ประเทศ และ permission | ฝังกฎซ้ำใน component |
| Repository | สัญญา CRUD/collection ของข้อมูลบริษัท | ส่ง DTO ดิบให้ UI โดยไม่ map |
| Provider | เรียกและแปลงข้อมูลภายนอก | ตัดสิน recommendation |
| Service | validation, analysis, score, recommendation, simulation | render UI หรือจัดการ DOM |
| Hook | loading/error/cache และเชื่อม resource กับ React | ฝังกฎธุรกิจที่ทดสอบยาก |
| Feature UI | แสดงผลและรับ interaction | import fixture หรือเขียน scoring logic |

### การไหลของการวิเคราะห์พื้นที่

1. ผู้ใช้ค้นหาหรือคลิกพิกัดในประเทศไทย
2. UI ส่งพิกัด รัศมี และพื้นที่ว่างให้ analysis service
3. เมื่อกดวิเคราะห์ provider orchestration เรียกแหล่งข้อมูลที่เปิดใช้งาน
4. Adapter แปลงผลลัพธ์เป็น domain contract พร้อมเวลาและคุณภาพข้อมูล
5. Analysis service สร้างปัจจัยคะแนนโดยไม่สร้างข้อเท็จจริงที่ขาดหาย
6. Scoring engine คำนวณคะแนนตาม configuration version
7. Recommendation engine สร้างระดับ ประเภทสถานี เหตุผล ความเสี่ยง และ data gaps
8. UI แสดง partial success, error หรือ unavailable state ตามจริง

### State และ persistence

- React context ใช้เฉพาะภาษา Demo Role permission UX และ preference ที่ใช้ข้าม feature
- Theme และ sidebar preference เก็บใน browser เพื่อความสะดวกของอุปกรณ์นั้น
- Runtime token อยู่ใน memory และหายเมื่อ refresh
- Partner submission ของต้นแบบเก็บ localStorage พร้อมคำเตือนว่าไม่ปลอดภัยและไม่ multi-user
- Company portfolio ไม่ใช้ข้อมูลสมมติเมื่อ API ไม่พร้อม

### สัญญา API ที่คาดหวัง

```text
GET    /sites
GET    /sites/:id
POST   /sites
PATCH  /sites/:id
DELETE /sites/:id
POST   /sites/:id/analyze
GET    /sites/:id/score
GET    /sites/:id/recommendation
GET    /ev-stations
GET    /competitors
GET    /gas-stations
GET    /pois
GET    /partners
POST   /partners
GET    /branches
GET    /opportunities
GET    /expansion/dashboard
```

Production contract ต้องมี pagination, filter, version, standard error, request ID, authentication, authorization และ Zod/OpenAPI schema การตอบ collection ในต้นแบบรองรับ JSON array หรือ `{ "data": [] }`

### สถาปัตยกรรมอนาคต

```text
Browser → Vercel/Next.js → REST API/BFF → NestJS/Node.js หรือ Go
        → PostgreSQL + PostGIS
        → Redis/cache, queue/workers, private object storage
        → External provider synchronization
```

เริ่มเพิ่ม backend เมื่อจำเป็นต้องมีผู้ใช้หลายคน ความปลอดภัยจริง ประวัติการแก้ไข งาน sync การอัปโหลด หรือ GIS workload ที่ browser ไม่เหมาะสม การ scale ควรวัดจาก workload จริงก่อนเพิ่ม cache, queue, read replica หรือแยก service

---

## English

### Objective

The architecture follows **Frontend-First, Backend-Ready, Database-Ready**. The prototype can demonstrate real public-provider analysis without a company database or backend, while preserving seams that can later be replaced by REST, PostgreSQL, and PostGIS without rebuilding feature UI.

### Current architecture

```text
Browser
  └─ Next.js App Router + React + TypeScript
      ├─ Feature UI
      ├─ Hooks / query state
      ├─ Services: scoring, recommendation, validation, analysis
      ├─ Provider contracts and adapters
      │   ├─ Nominatim / Overpass / Open-Meteo / WorldPop / TomTom
      │   └─ Map tiles / terrain / building vectors
      ├─ Repository contracts
      │   ├─ Company Business REST API adapter
      │   ├─ Empty fallback repositories
      │   └─ Local browser repository for labelled prototype submissions
      └─ Browser memory for temporary provider configuration
```

MapLibre is the GIS renderer. Feature components do not own provider URLs or scoring logic. Arbitrary-location analysis is deterministic and combines whichever providers respond. One provider failure must not crash the map or discard successful context from other providers.

### Layer responsibilities

| Layer | Responsibility | Must not |
| --- | --- | --- |
| Domain | UI-independent business models and vocabulary | Import React, MapLibre, fetch, or database clients |
| Config | Weights, thresholds, radii, station types, countries, permissions | Duplicate rules inside components |
| Repository | Company CRUD/collection contracts | Leak unmapped transport DTOs to UI |
| Provider | Fetch and normalize external observations | Decide recommendations |
| Service | Validation, analysis, score, recommendation, simulation | Render UI or manipulate DOM |
| Hook | Loading/error/cache and React resource binding | Hide hard-to-test business rules |
| Feature UI | Presentation and interaction | Import fixtures or calculate scores |

### Location-analysis sequence

1. The user searches or clicks a coordinate in Thailand.
2. UI passes coordinates, radius, and optional area to the analysis service.
3. On explicit Analyze action, provider orchestration calls enabled sources.
4. Adapters normalize results into domain contracts with time and quality context.
5. Analysis derives score factors without inventing missing facts.
6. The scoring engine applies a versioned configuration.
7. The recommendation engine returns a band, station type, reasons, risks, and data gaps.
8. UI renders partial success, errors, and unavailable states honestly.

### State and persistence

- React context owns language, Demo Role permission UX, and limited cross-feature preferences.
- Theme and sidebar preference are device-local convenience settings.
- Runtime tokens remain in memory and clear on refresh.
- Prototype partner submissions use localStorage with explicit security and multi-user warnings.
- Company portfolio screens do not fabricate records when the API is absent.

### Expected API contract

The expected endpoints are listed above. Production contracts add pagination, filtering, versions, standardized errors, request IDs, authentication, authorization, and Zod/OpenAPI schemas. Prototype company collections accept either a JSON array or `{ "data": [] }`.

### Future architecture

```text
Browser → Vercel/Next.js → REST API/BFF → NestJS/Node.js or Go
        → PostgreSQL + PostGIS
        → Redis/cache, queues/workers, private object storage
        → External provider synchronization
```

Introduce the backend when multi-user persistence, production security, audit history, provider synchronization, uploads, or server-side GIS workload requires it. Add caches, queues, replicas, or service separation only in response to measured load.

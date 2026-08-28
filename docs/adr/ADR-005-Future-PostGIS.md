# ADR-005: Future PostgreSQL + PostGIS / PostgreSQL + PostGIS ในอนาคต

- **Status / สถานะ:** Accepted for future phase / ยอมรับสำหรับระยะอนาคต
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

Browser prototype สามารถวาดรัศมีและคำนวณบริบทอย่างง่าย แต่ไม่เหมาะเป็น spatial authority สำหรับข้อมูลจำนวนมาก ระยะทางแม่นยำ intersection flood, parcel geometry, density และ multi-user query

### การตัดสินใจ

เมื่อมี backend ให้ใช้ PostgreSQL + PostGIS เก็บ Point/Polygon/MultiPolygon ใน SRID 4326 ใช้ geography สำหรับระยะเมตร geometry สำหรับ topology และ projected CRS ที่เหมาะสมสำหรับพื้นที่ เพิ่ม spatial index และ versioned source snapshots

### ผลกระทบ

- Query radius, nearest, intersection, area และ clustering ทำซ้ำและตรวจสอบได้
- รองรับ authoritative boundary และ server vector tile
- ต้องมี migration, index tuning, geometry validation, backup และ GIS expertise
- งานหนักอาจต้อง queue/materialized summary
- Prototype ห้ามอ้างว่ากำลังใช้ PostGIS ก่อน integration จริง

### ทางเลือก

เก็บ lat/lon ใน relational database ธรรมดาไม่เพียงพอสำหรับ topology Browser-only Turf-style operation ไม่เหมาะกับ authority/scale Dedicated GIS service อาจพิจารณาภายหลังเมื่อ workload วัดได้

## English

### Context and decision

Browser geometry is useful for prototype interaction but cannot be the spatial authority for accurate, large, multi-user radius, nearest, flood intersection, parcel, or density work. A future backend will use PostgreSQL + PostGIS with SRID 4326 geometry, geography distance, suitable projected area calculation, spatial indexes, and versioned source snapshots.

### Consequences and alternatives

PostGIS enables reproducible spatial queries and server tiles but adds migrations, tuning, validation, backup, and GIS operations. Heavy work may require queues or summaries. Plain latitude/longitude storage and browser-only GIS were insufficient; a dedicated GIS service is deferred until measured need.

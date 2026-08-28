# Limitations / ข้อจำกัด

## ภาษาไทย

### ข้อมูล

- Public-provider data ไม่รับประกัน real-time, completeness, accuracy หรือ SLA
- Company portfolio ว่างจนกว่าจะเชื่อม Business API; runtime ไม่เติมข้อมูลตลาดสมมติ
- Nominatim/Overpass และ public tiles เป็น shared infrastructure อาจช้าหรือปิดชั่วคราว
- Population, weather, elevation, river discharge และ traffic มี resolution/cadence ต่างกันและอาจไม่ตรงระดับแปลง
- Flood output เป็น river-model context ไม่ใช่ผลยืนยันน้ำท่วมแปลงที่ดิน
- Electrical capacity, transformer, ownership, access design และ commercial terms ต้องสำรวจ

### GIS และ 3D

- Browser radius polygon เป็น approximation สำหรับ demo
- Production distance/intersection/density ควรใช้ PostGIS และ authoritative datasets
- Terrain ไม่เท่ากับอาคาร; building extrusion ขึ้นกับ OSM/OpenFreeMap coverage และ height quality
- พื้นที่ราบอาจดูไม่เป็น 3D เด่น
- ไม่มี offline basemap, route network analysis หรือ persisted drawing

### ความปลอดภัยและ persistence

- Demo Role ไม่ใช่ authentication หรือ authorization
- localStorage submission ไม่เข้ารหัส ไม่ multi-user และไม่ sync
- Browser-visible token ไม่ใช่ secret; memory-only เพียงลดการคงอยู่
- Local photo preview ไม่ใช่ durable/private upload
- ไม่มี production audit, backup, disaster recovery หรือ incident response

### ธุรกิจ

- Score เป็น screening indicator ไม่ใช่ investment approval
- Recommendation ใช้ demo configuration `demo-v1.0`
- Station footprint/charger ranges ไม่ใช่มาตรฐานวิศวกรรม
- Financial simulation ไม่รวมต้นทุนและความผันผวนทั้งหมดและไม่รับประกัน ROI
- การเปรียบเทียบมีความหมายเมื่อข้อมูลและ configuration version สอดคล้องกัน

### UX และ localization

Primary interface รองรับไทย/อังกฤษ แต่เนื้อหาจาก provider อาจเป็นภาษาต้นทาง Professional launch ต้องมี translation review, terminology glossary, accessibility audit และ device testing เพิ่มเติม

---

## English

### Data

Public providers do not guarantee real-time, completeness, accuracy, or SLA. Company screens remain empty until connected. Shared geocoding, query, and tile infrastructure can be slow. Population, weather, elevation, discharge, and traffic differ in resolution. Flood output is not parcel certification. Power, ownership, access, and commercial terms require survey.

### GIS and 3D

Browser radius work is a demo approximation; production uses PostGIS and authoritative data. Terrain is not buildings. Extrusions depend on OSM/OpenFreeMap coverage and quality. Flat terrain may look subtle. There is no offline basemap, network routing, or persisted drawing.

### Security and persistence

Demo Role is not identity. localStorage is unencrypted, device-local, and not multi-user. Browser tokens are not secrets. Photo preview is not durable private storage. Production audit, backup, disaster recovery, and incident response are absent.

### Business, UX, and localization

Scores screen sites but do not approve investments. Current station and financial assumptions are demonstrative and not guarantees. Comparisons require aligned data/configuration. Primary UI is bilingual, while provider text may remain source-language; professional launch requires linguistic and accessibility review.

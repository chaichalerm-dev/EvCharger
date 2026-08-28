# Future PostGIS Design / การออกแบบ PostGIS ในอนาคต

## ภาษาไทย

ต้นแบบปัจจุบัน **ไม่ได้ใช้ PostGIS** การคำนวณ browser มีไว้สาธิต UX เท่านั้น Production ควรใช้ PostgreSQL + PostGIS เป็น spatial authority

### Geometry design

| ข้อมูล | ชนิดแนะนำ | SRID |
| --- | --- | ---: |
| Site, station, POI, branch | `geometry(Point, 4326)` | 4326 |
| Site boundary | `geometry(Polygon, 4326)` | 4326 |
| Flood/admin coverage | `geometry(MultiPolygon, 4326)` | 4326 |
| Route/access segment | `geometry(LineString, 4326)` | 4326 |

ใช้ `geography` cast สำหรับระยะเมตร/รัศมี และใช้ geometry สำหรับ topology/intersection พื้นที่จริงควร transform ไป projected CRS ที่เหมาะกับประเทศไทยก่อน `ST_Area`

### Query หลัก

- `ST_DWithin`: จุดในรัศมีและ candidate nearby
- `ST_Distance`: คู่แข่ง/สถานี/หม้อแปลงที่ใกล้ที่สุด
- `ST_Intersects`: site กับ flood zone หรือ administrative area
- `ST_Intersection`: สัดส่วนพื้นที่ซ้อนทับ
- `ST_Contains`/`ST_Covers`: ตรวจจังหวัด อำเภอ และ coverage
- `ST_Area`: ยืนยันพื้นที่ polygon หลัง transform
- `ST_ClusterDBSCAN`: cluster/density ฝั่ง server
- `ST_AsMVT`: vector tile สำหรับข้อมูลจำนวนมาก

### Index และ performance

เพิ่ม GiST/SP-GiST ตามชนิดข้อมูล ใช้ bounding-box prefilter, query radius/limit, pagination, simplified geometry, materialized density summaries และ tile cache ตรวจ execution plan ด้วย `EXPLAIN ANALYZE` งานหนักควรเข้า queue และบันทึก job version

### Data quality และความปลอดภัย

Validate geometry ด้วย `ST_IsValid`, normalize longitude/latitude, เก็บ accuracy/CRS/source และ reject geometry ที่อยู่นอก coverage โดยไม่ตั้งใจ ใช้ parameterized query เท่านั้น RLS ช่วย tenant isolation แต่ไม่แทน backend authorization จำกัด complexity ของ user polygon เพื่อป้องกัน expensive spatial query

### ตัวอย่าง conceptual query

```sql
SELECT id, ST_Distance(location::geography, $1::geography) AS distance_m
FROM ev_station
WHERE ST_DWithin(location::geography, $1::geography, $2)
ORDER BY distance_m
LIMIT $3;
```

ค่าพิกัด รัศมี และ limit ต้องส่งเป็น parameter ไม่ต่อ string SQL

---

## English

The current prototype **does not use PostGIS**. Browser calculations demonstrate UX only. Production should make PostgreSQL + PostGIS the spatial authority.

### Geometry design

Use Point for sites/stations/POIs/branches, Polygon for site boundaries, MultiPolygon for flood/admin coverage, and LineString for routes, all in SRID 4326. Cast to geography for metre-based distance. Transform to a suitable projected CRS for defensible area calculation.

### Core queries

Use `ST_DWithin`, `ST_Distance`, `ST_Intersects`, `ST_Intersection`, `ST_Contains`/`ST_Covers`, `ST_Area`, `ST_ClusterDBSCAN`, and `ST_AsMVT` for radius, nearest, overlap, coverage, area, clustering, and server tiles.

### Performance

Use spatial indexes, bounding-box prefilters, bounded radius/limits, pagination, simplified geometry, materialized density summaries, and tile caches. Inspect plans with `EXPLAIN ANALYZE`. Queue heavy analysis and retain job/configuration versions.

### Quality and security

Validate geometry, normalize coordinates, store accuracy/CRS/source, and reject unintended out-of-coverage data. Use parameterized SQL. RLS complements but never replaces backend authorization. Bound user polygon complexity to prevent expensive spatial-query abuse.

# Map and GIS Behavior / แผนที่และพฤติกรรม GIS

## ภาษาไทย

### หมุดเลือกพื้นที่และการเคลื่อนกล้อง

- หมุดวิเคราะห์ยึดกับพิกัดภูมิศาสตร์ของ MapLibre จึงเคลื่อนบนจอเฉพาะเมื่อผู้ใช้แพนหรือซูมแผนที่ และจะยังอยู่เหนือพิกัดเดิมเสมอ
- การคลิกบนแผนที่จะวางหมุดตรงตำแหน่งที่คลิกโดยไม่บังคับเลื่อนกล้องหรือดึงหมุดเข้ากลางจอ
- การเลือกผลค้นหาจะเลื่อนกล้องไปยังสถานที่นั้น เพราะผลค้นหาอาจอยู่นอกมุมมองปัจจุบัน
- ปุ่มกลับไปจุดที่เลือกเป็นคำสั่งที่ผู้ใช้กดเองเมื่อต้องการจัดกล้องกลับมาที่หมุด
- ระบบมีจุดวิเคราะห์ที่กำลังใช้งานหนึ่งจุด การเลือกจุดใหม่จะแทนจุดเดิม ส่วนการเก็บหลายพื้นที่เพื่อเทียบกันใช้ขั้นตอน Site Comparison
- ระหว่างเริ่มแผนที่ใช้ background layer ภายใน MapLibre โดยตรง ไม่มี overlay หมุดหรือวงรัศมีแบบ HTML ที่ตรึงกับกึ่งกลางหน้าจอ
- source และ layer ของหมุดเริ่มทำงานเมื่อ `style.load` โดยไม่รอ raster tile ภายนอกทั้งหมด ส่วนการเปลี่ยนพิกัดจะตรวจว่า GeoJSON source พร้อมโดยตรง ไม่ใช้ `isStyleLoaded()` ซึ่งอาจเป็น false ชั่วคราวระหว่างโหลด tile
- หมุดตำแหน่งหลักใช้ native MapLibre marker แบบขนาดคงที่ซึ่งยึดกับ longitude/latitude และอยู่เหนือ 2D/3D canvas จึงไม่ขยายเมื่อซูมออกและเลื่อนออกจากจอเมื่อ pan ออกจากพิกัดนั้น

### Basemap และ fallback

MapLibre GL JS render OpenStreetMap raster tiles โดยไม่ต้องใช้ paid token แกนหลัก ระหว่างเริ่มต้น MapLibre แสดง background layer ภายใน style ของตนเอง จึงไม่มี overlay แผนที่ หมุด หรือวงรัศมีแบบ HTML ซ้อนทับ canvas หาก tile ภายนอกไม่พร้อม ระบบแสดงคำเตือนตามจริงและยังไม่อ้างว่ามี basemap แบบ offline

### ขอบเขตประเทศไทย

Nominatim search ใช้ country code `TH` และกล้องถูกจำกัดด้วย navigation envelope จาก configuration ไม่ฝังรายชื่อจังหวัดใน logic ผู้ใช้ยังสามารถเตรียม coverage config สำหรับประเทศอื่นในอนาคต ป้ายข้อความขอบเขตประเทศไทยถูกเอาออกจาก canvas เพื่อลดสิ่งรบกวน แต่ข้อจำกัดยังทำงาน

### การเลือกและวิเคราะห์พื้นที่

- ค้นหาชื่อสถานที่หรือคลิก map
- selected point แสดงด้วย marker ที่อยู่เหนือ terrain/building
- เลือกรัศมี 1, 3, 5 หรือ 10 กม. จาก config
- สร้าง geodesic radius polygon ใน browser สำหรับ prototype
- ระบุพื้นที่ว่างเป็น optional input
- กด Analyze เพื่อเรียก Overpass, Open-Meteo, WorldPop และ TomTom เมื่อเปิดใช้งาน
- ผล partial failure แสดงแยก ไม่ทำให้ map crash

งาน production ใช้ PostGIS geography สำหรับ distance/radius และ authoritative boundary แทน browser approximation

### Layer และสัญลักษณ์

Layer controls มี EV stations, competitors, gas stations, POI, flood, partner branches และ opportunities ทุกแถวมี checkbox, icon, label และสถานะ on/off ป้าย legend บนแผนที่พับเป็นปุ่มเล็กโดยค่าเริ่มต้นและเปิดดู category ทั้งหมดได้

Marker ใช้ Lucide pictogram และสีเป็นสัญญาณรอง ได้แก่ lightning, building, fuel pump, pin, handshake และ target Symbol ใช้ zoom expression ที่จำกัดขนาด: เล็กมากในระดับประเทศ/จังหวัดและค่อยเข้าใกล้ขนาด detail เมื่อซูมเข้า จึงไม่ขยายบังพื้นที่เมื่อซูมออก Cluster badge และ count ใช้หลักเดียวกัน

### 3D terrain และอาคาร

ปุ่ม icon-only เปิดสอง layer อิสระ:

1. Mapterhorn raster DEM สำหรับ terrain/hillshade พร้อม exaggeration ระดับสาธิต
2. OpenFreeMap vector building สำหรับ fill extrusion จาก `render_height`/`render_min_height`

เมื่อเปิด 3D กล้องกลับไป selected point, zoom ใกล้, pitch 65° และ bearing ที่ช่วยอ่านรูปทรง Terrain มี coverage กว้าง แต่อาคาร 3D ปรากฏเฉพาะพื้นที่ที่ OpenStreetMap มี building geometry/height ที่ใช้ได้ พื้นที่ราบในกรุงเทพฯ อาจดูเกือบแบนแม้ terrain ทำงาน ระบบแสดงสถานะ terrain+building, terrain-only, loading หรือ unavailable ตามจริง

Building เริ่ม render ที่ zoom 14 ใช้ antialias และวางใต้ analysis polygon, marker และ cluster เพื่อไม่บังข้อมูลตัดสินใจ ปุ่ม recenter เป็น icon-only พร้อม accessible name

### Accessibility และ mobile

Canvas มี accessible label การค้นหา รัศมี และ analyze ใช้งานได้ด้วย keyboard ปุ่ม icon-only มี `aria-label`, `title`, focus-visible และสถานะ pressed ป้าย click instruction และ coverage ถูกนำออกเพื่อรักษาพื้นที่ Mobile เรียง control, map, result และจำกัด legend ที่เปิดไม่ให้ครอบ canvas มากเกินไป

### งานอนาคต

Authoritative parcel/flood/traffic contracts, polygon drawing ที่ persist, route/access analysis, server tiling, vector tile strategy, provider health, offline plan, PostGIS query และ server-side credential proxy

---

## English

### Basemap and fallback

MapLibre renders OpenStreetMap raster tiles without a paid core token. During startup, MapLibre renders its own style background layer; no HTML map, marker, or radius overlay sits above the canvas. If external tiles fail, the UI reports that condition honestly and does not claim an offline basemap.

### Thailand scope

Nominatim search uses country code `TH`, and the camera is constrained by a configurable navigation envelope. Province names are not embedded in business logic. The visible Thailand badge was removed to reduce clutter; the constraint remains active.

### Selection and analysis

The active analysis pin is anchored to a MapLibre geographic coordinate. A direct map click places the pin exactly where clicked without recentering the viewport; selecting a search result recenters because it may be outside the current view. The explicit recenter control returns the camera to the selected point. One active analysis point is maintained at a time, while multi-site decisions belong in Site Comparison. Startup rendering uses MapLibre's own background layer and never adds a screen-fixed HTML pin, radius, or geographic overlay.

Selection sources and layers initialize on `style.load` without waiting for every external raster tile. Coordinate changes update writable GeoJSON sources directly rather than gating on `isStyleLoaded()`, which can be temporarily false during ordinary tile loading.

The primary selected pin also uses a fixed-size native MapLibre marker anchored to longitude/latitude above the 2D/3D canvas. It does not grow when zooming out and naturally leaves the viewport when the map is panned away from that coordinate.

Users search or click, choose a configured radius, optionally enter area, and explicitly Analyze. The prototype builds a browser geodesic polygon and calls enabled providers with isolated failure handling. Production replaces approximate radius work with PostGIS geography and authoritative boundaries.

### Layers and symbols

Layer controls expose every category with checkbox, icon, label, and on/off state. The on-map legend is collapsed by default. Lucide pictograms carry category meaning, with color as a secondary cue. Capped zoom expressions make markers and clusters small at country/province zoom and only approach detail size when zooming in.

### 3D terrain and buildings

3D independently enables Mapterhorn raster DEM terrain/hillshade and OpenFreeMap fill-extrusion buildings. The camera centers on the selected point at close zoom, 65° pitch, and a useful bearing. Terrain has broad coverage, while buildings appear only where usable OpenStreetMap geometry and height exist. Flat Bangkok terrain may still look nearly level. UI reports terrain-plus-buildings, terrain-only, loading, or unavailable honestly.

Buildings begin at zoom 14 with antialiasing and remain below analysis and marker overlays. Recenter and 3D actions are compact icon-only controls with accessible names.

### Accessibility, mobile, and future work

Search, radius, and analysis controls are keyboard-accessible. Icon actions expose labels, titles, focus, and pressed state. Mobile preserves canvas space. Future work includes authoritative parcel/flood/traffic data, persisted polygon drawing, access routing, server tiling, provider health, offline strategy, PostGIS, and a credential proxy.

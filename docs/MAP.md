# Map and GIS Behavior / แผนที่และพฤติกรรม GIS

## ภาษาไทย

### หมุดเลือกพื้นที่และการเคลื่อนกล้อง

- หมุดวิเคราะห์ยึดกับพิกัดภูมิศาสตร์ของ MapLibre จึงเคลื่อนบนจอเฉพาะเมื่อผู้ใช้แพนหรือซูมแผนที่ และจะยังอยู่เหนือพิกัดเดิมเสมอ
- การคลิกบนแผนที่จะวางหมุดตรงตำแหน่งที่คลิกโดยไม่บังคับเลื่อนกล้องหรือดึงหมุดเข้ากลางจอ
- การเลือกผลค้นหาจะเลื่อนกล้องไปยังสถานที่นั้น เพราะผลค้นหาอาจอยู่นอกมุมมองปัจจุบัน
- ปุ่มกลับไปจุดที่เลือกเป็นคำสั่งที่ผู้ใช้กดเองเมื่อต้องการจัดกล้องกลับมาที่หมุด
- ระบบมีจุดวิเคราะห์ที่กำลังใช้งานหนึ่งจุด การเลือกจุดใหม่จะแทนจุดเดิม ส่วนการเก็บหลายพื้นที่เพื่อเทียบกันใช้ขั้นตอน Site Comparison
- ระหว่างเริ่มแผนที่ใช้ background layer ภายใน MapLibre โดยตรง ไม่มี overlay หมุดหรือวงรัศมีแบบ HTML ที่ตรึงกับกึ่งกลางหน้าจอ
- วงรัศมีเป็น SVG overlay ที่นำ polygon ระยะ geodesic มาฉายเป็นพิกัดหน้าจอด้วย `map.project()` และคำนวณใหม่เมื่อเลื่อน ซูม หมุน หรือปรับขนาดแผนที่ จึงไม่ขึ้นกับสถานะ WebGL/raster tile ภายนอก
- หมุดตำแหน่งหลักมีเพียงหนึ่งอัน ใช้ native MapLibre marker แบบขนาดคงที่ซึ่งยึดกับ longitude/latitude และอยู่เหนือ 2D/3D canvas จึงไม่ขยายเมื่อซูมออกและเลื่อนออกจากจอเมื่อ pan ออกจากพิกัดนั้น
- วงรัศมีใช้ polygon ตามระยะ geodesic พร้อมพื้นโปร่งและเส้นขอบสองชั้นสีขาว/น้ำเงินเพื่อให้เห็นบนแผนที่ถนนได้ชัด

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
- กด Analyze เพื่อเรียก Overpass (fallback เป็น Photon OSM), Open-Meteo, WorldPop และ TomTom เมื่อเปิดใช้งาน
- ผล partial failure แสดงแยก ไม่ทำให้ map crash

งาน production ใช้ PostGIS geography สำหรับ distance/radius และ authoritative boundary แทน browser approximation

### Layer และสัญลักษณ์

Layer controls มี EV stations, competitors, gas stations, POI, flood, partner branches และ opportunities ทุกแถวมี checkbox, icon, label และสถานะ on/off ป้าย legend บนแผนที่พับเป็นปุ่มเล็กโดยค่าเริ่มต้นและเปิดดู category ทั้งหมดได้

ข้อมูลที่ได้หลังผู้ใช้กดวิเคราะห์แสดงเป็น native MapLibre DOM marker พร้อม SVG pictogram ได้แก่ lightning, building, fuel pump, pin และ handshake โดยใช้สีเป็นสัญญาณรอง Marker อยู่เหนือ canvas ทั้ง 2D/3D และมีขนาดคงที่บนหน้าจอ จึงไม่ขยายตามการซูมออก ระบบรวมจุดด้วย screen-grid clustering ตามระดับซูมเพื่อลดการบังพื้นที่ และผู้ใช้กดกลุ่มเพื่อซูมเข้าได้ แถวชั้นข้อมูลแสดง `รอโหลด` ก่อนวิเคราะห์และจำนวนรายการจริงหลังวิเคราะห์

### 3D terrain และอาคาร

ปุ่ม icon-only เปิดอาคาร 3D จาก OpenFreeMap vector tiles เพียง pipeline เดียว ไม่มี GeoJSON building fallback หรือ terrain layer อีกชุดมาวาดซ้อน

เมื่อเปิด 3D กล้องกลับไป selected point ที่ zoom 15.5, pitch 55° และ bearing ที่ช่วยอ่านผนังอาคาร Vector tiles โหลดตาม viewport ขณะเลื่อนหรือซูม จึงไม่จำกัดอยู่ในรัศมีรอบหมุด อาคาร 3D ปรากฏในพื้นที่ที่ OpenStreetMap มี building geometry และสถานะพร้อมนับเฉพาะ extrusion ที่วาดอยู่ใน viewport จริง

Building เริ่ม render ที่ zoom 14 ใช้ antialias และวางใต้ analysis polygon, marker และ cluster เพื่อไม่บังข้อมูลตัดสินใจ ปุ่ม recenter เป็น icon-only พร้อม accessible name

### Accessibility และ mobile

Canvas มี accessible label การค้นหา รัศมี และ analyze ใช้งานได้ด้วย keyboard ปุ่ม icon-only มี `aria-label`, `title`, focus-visible และสถานะ pressed ป้าย click instruction และ coverage ถูกนำออกเพื่อรักษาพื้นที่ Mobile เรียง control, map, result และจำกัด legend ที่เปิดไม่ให้ครอบ canvas มากเกินไป

### งานอนาคต

Authoritative parcel/flood/traffic contracts, polygon drawing ที่ persist, route/access analysis, server tiling, vector tile strategy, provider health, offline plan, PostGIS query และ server-side credential proxy

OpenFreeMap ส่ง source-layer `building` แบบแบ่ง tile และ MapLibre ใช้ `render_height`/`render_min_height` ทำ fill extrusion หากข้อมูลความสูงไม่ครบจะใช้ค่าความสูงแสดงผลขั้นต่ำ 8 เมตร อาคารทั้งหมดใช้สีและกฎเดียวกัน โดยหมุดเป็นตัวบอกตำแหน่งที่เลือก

#### การแสดงอาคารในพื้นที่เมือง

ระบบมี `openfreemap-buildings` source และ `3d-buildings` layer อย่างละหนึ่งรายการเท่านั้น เปิด–ปิดด้วย visibility โดยไม่สร้าง source อื่นแข่งกัน อาคารถูกวางใต้ label layer แบบเดียวกับ BTSMRT และไม่เปิด raster terrain/hillshade จึงไม่มี depth buffer หรือข้อมูลสองชุดซ้อนกัน

---

## English

### Basemap and fallback

MapLibre renders OpenStreetMap raster tiles without a paid core token. During startup, MapLibre renders its own style background layer; no HTML map, marker, or radius overlay sits above the canvas. If external tiles fail, the UI reports that condition honestly and does not claim an offline basemap.

### Thailand scope

Nominatim search uses country code `TH`, and the camera is constrained by a configurable navigation envelope. Province names are not embedded in business logic. The visible Thailand badge was removed to reduce clutter; the constraint remains active.

### Selection and analysis

The active analysis pin is anchored to a MapLibre geographic coordinate. A direct map click places the pin exactly where clicked without recentering the viewport; selecting a search result recenters because it may be outside the current view. The explicit recenter control returns the camera to the selected point. One active analysis point is maintained at a time, while multi-site decisions belong in Site Comparison. Startup rendering uses MapLibre's own background layer and never adds a screen-fixed HTML pin, radius, or geographic overlay.

The radius is an SVG overlay that projects a geodesic polygon through `map.project()` and recalculates on pan, zoom, rotation, and resize. It therefore remains geographically anchored without depending on external raster-tile or WebGL-layer readiness.

Exactly one primary selected pin uses a fixed-size native MapLibre marker anchored to longitude/latitude above the 2D/3D canvas. It does not grow when zooming out and naturally leaves the viewport when the map is panned away from that coordinate. The geodesic radius polygon uses a translucent blue fill and high-contrast white/blue double outline.

Users search or click, choose a configured radius, optionally enter area, and explicitly Analyze. The prototype builds a browser geodesic polygon and calls enabled providers with isolated failure handling. Nearby OSM data uses the configured Overpass endpoint first and bounded Photon queries as fallback. Production replaces approximate radius work with PostGIS geography and authoritative boundaries.

### Layers and symbols

Layer controls expose every category with checkbox, icon, label, and on/off state. The on-map legend is collapsed by default. After explicit analysis, provider entities render as native MapLibre DOM markers with SVG pictograms above both 2D and 3D canvases. Color is a secondary cue. Fixed-size markers do not grow when zooming out, while screen-grid clustering reduces overlap and lets users click a group to zoom in. Layer rows show `Pending` before analysis and the actual result count afterward.

### 3D terrain and buildings

Urban 3D uses OpenFreeMap vector tiles as its only building source and keeps raster terrain/hillshade disabled. This prevents both depth occlusion and overlapping building renderers.

MapLibre maintains exactly one `openfreemap-buildings` source and one `3d-buildings` extrusion layer. Tiles follow the viewport while users pan or zoom, so coverage is not bounded to the selected point. No building API or GeoJSON fallback is requested.

Buildings use MapLibre `fill-extrusion`. No alternate footprint, GeoJSON extrusion, terrain, or HTML building blocks are placed over the canvas.

The camera centers on the selected point at zoom 15.5, 55° pitch, and a useful bearing. OpenFreeMap's `building` source-layer supplies `render_height` and `render_min_height`; an 8 m display fallback is used when height is absent. All buildings share one visual style and height rule, and the map pin identifies the selected position. The ready count includes only extrusions rendered in the current viewport.

Buildings begin at zoom 14 with antialiasing and remain below analysis and marker overlays. Recenter and 3D actions are compact icon-only controls with accessible names.

### Accessibility, mobile, and future work

Search, radius, and analysis controls are keyboard-accessible. Icon actions expose labels, titles, focus, and pressed state. Mobile preserves canvas space. Future work includes authoritative parcel/flood/traffic data, persisted polygon drawing, access routing, server tiling, provider health, offline strategy, PostGIS, and a credential proxy.

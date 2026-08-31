# Troubleshooting / การแก้ปัญหา

## ภาษาไทย

### แผนที่ว่างหรือ tile ไม่ขึ้น

ตรวจอินเทอร์เน็ตและ endpoint `osm-tiles` ใน Settings ถ้า public tile ไม่พร้อม fallback context ควรยังให้เลือกจุดได้ ตรวจ browser console เฉพาะ error ที่เกี่ยวข้องและอย่าลบ attribution หรือเปลี่ยนเป็น provider ที่ไม่อนุญาต

### กด 3D แล้วดูแบน

ซูมเข้าใกล้ selected point ตรวจสถานะ 3D พื้นที่กรุงเทพฯ อาจราบจริง Terrain-only หมายถึง DEM พร้อมแต่ไม่มี building geometry/height ที่ใช้ได้ ตรวจ Mapterhorn และ OpenFreeMap connection แยกกัน

### Marker บังพื้นที่เมื่อซูมออก

ตรวจว่า entity marker ใช้ `.map-entity-marker` ขนาดคงที่และ screen-grid clustering ทำงาน ห้ามผูก CSS scale กับ zoom/perspective โดยไม่มีขอบเขต Marker ต้องยึดพิกัดภูมิศาสตร์และอยู่เหนือ canvas

### วิเคราะห์แล้วไม่เห็นสัญลักษณ์ภายในรัศมี

ก่อนกด `วิเคราะห์พื้นที่นี้` แถว EV/คู่แข่ง/ปั๊มน้ำมัน/POI จะแสดง `รอโหลด` ตามเจตนา หลังวิเคราะห์ให้ดูจำนวนในแต่ละแถว หากมากกว่า 0 ต้องพบ `.map-entity-marker` หรือ `.map-entity-cluster` บนแผนที่ และกดกลุ่มเพื่อซูมดูจุดย่อยได้ หากทุกจำนวนเป็น 0 พร้อมคำเตือน Nearby OSM ให้ตรวจทั้ง Overpass และ Photon endpoint ใน Settings แล้วลองอีกครั้ง ระบบจะ fallback ไป Photon อัตโนมัติเมื่อ Overpass ไม่พร้อม แต่ public services ไม่มีการรับประกัน availability

### เลือกพิกัดแล้วไม่เห็นหมุดหรือวงรัศมี

ตรวจว่ามี `.analysis-radius-overlay` เพียงหนึ่งชุด ภายในต้องมี polygon สำหรับ fill, casing และ line พร้อมค่า `data-radius-km` การเปลี่ยนจุดหรือรัศมีต้องเรียกตัวฉายพิกัดใหม่ และ event `move`/`resize` ต้องอัปเดต SVG ผ่าน `map.project()`

หมุดตำแหน่งหลักแสดงด้วย native MapLibre marker ที่ผูกกับ longitude/latitude เหนือ WebGL canvas จึงไม่ควรถูกชั้น 3D บัง ไม่ขยายตามการซูม และต้องเลื่อนออกจากหน้าจอเมื่อ pan ออกจากพิกัดนั้น

หากเห็นหมุดสองอัน ให้ตรวจว่าไม่มี WebGL `selected-point` symbol/circle layer เหลืออยู่ ระบบต้องแสดงหมุด native เพียงหนึ่งอัน ส่วนวงรัศมีใช้ SVG `.analysis-radius-overlay`

### ค้นหาไม่พบหรือ Nominatim ล้มเหลว

ใช้ชื่อสถานที่/จังหวัดที่ชัดเจน รอแล้วลองใหม่ตาม public usage policy หรือคลิก map โดยตรง ตรวจว่า search จำกัด `TH` และ endpoint ใช้ HTTPS

### วิเคราะห์แล้วข้อมูลบางส่วนหาย

ดู provider error ใน result panel แต่ละ provider แยก failure ได้ TomTom ต้องมี key WorldPop อาจใช้ async task Overpass อาจช้า Missing data ไม่ใช่ score 0 โดยอัตโนมัติและอาจแสดง Requires Site Survey

### Company dashboard ว่าง

เป็นพฤติกรรมที่ถูกต้องใน Real Provider Mode จนกว่าจะตั้ง Company Business REST API ตรวจ endpoint, bearer token, CORS และ response เป็น array หรือ `{ "data": [] }`

### Token หายหลัง refresh

เป็นการออกแบบด้านความปลอดภัยของต้นแบบ Runtime token อยู่ใน memory เท่านั้น กรอกใหม่หรือเชื่อม backend/BFF สำหรับ production ห้ามแก้ให้เก็บ secret ใน localStorage

### Partner submission ไม่ปรากฏบนเครื่องอื่น

ข้อมูลอยู่ localStorage ของ browser/device นั้นเท่านั้น ไม่ใช่ cloud database ใช้ export/manual demonstration หรือสร้าง backend repository ใน phase ถัดไป

### ภาษา/theme/sidebar ไม่จำค่า

ตรวจว่า browser อนุญาต localStorage และไม่มี privacy mode/extension ล้างค่า First-run default คือไทย + light Sidebar persistence ใช้ key ของอุปกรณ์

### Build ไม่ผ่าน

- Vercel: Node 22.13+, `npm ci`, `npm run build:vercel`
- Sites: `npm run build` และคง Vite/Vinext/hosting configuration
- ตรวจ TypeScript/lint error แรกก่อน warning ขนาด chunk
- ลบ/แก้เฉพาะ generated cache ที่ปลอดภัย ห้าม reset งานผู้ใช้

### Vercel แสดง Deployment Blocked โดยยังไม่มี build log

หากหน้ารายละเอียดระบุว่า commit author email ไม่ถูกต้อง แปลว่า Vercel บล็อกก่อนเรียก `npm run build:vercel` จึงไม่ใช่ TypeScript หรือ Next.js build error ให้ตรวจผู้เขียน commit ปัจจุบัน ตั้ง `git config --local user.email` เป็นอีเมลที่ยืนยันกับ GitHub แล้วสร้าง commit ใหม่และ push ห้ามแก้ด้วยการใส่ secret หรือปิด security control

---

## English

### Blank basemap

Check network access and the `osm-tiles` endpoint. The local fallback should still allow point selection. Preserve attribution and use only permitted providers.

### 3D looks flat

Zoom close to the selected point and read the status. Bangkok may be genuinely flat. Terrain-only means DEM is available but usable building geometry/height is absent. Check Mapterhorn and OpenFreeMap independently.

### Markers cover the map

Verify fixed-size `.map-entity-marker` rendering, screen-grid clustering, and geographic anchoring above the canvas. Avoid unbounded DOM/perspective scaling.

### No symbols appear inside the analysis radius

EV, competitor, fuel, and POI rows intentionally show `Pending` until the user presses **Analyze this area**. After analysis, any non-zero category must render a `.map-entity-marker` or `.map-entity-cluster`; click a cluster to zoom into its members. If all counts remain zero with a Nearby OSM warning, verify both Overpass and Photon endpoints in Settings and retry. The client automatically falls back to bounded Photon queries, but public-service availability is not guaranteed.

### A selected coordinate has no visible pin or radius

Confirm that exactly one `.analysis-radius-overlay` exists and contains fill, casing, and line polygons with `data-radius-km`. Location/radius changes and MapLibre `move`/`resize` events must reproject the SVG points through `map.project()`.

The primary selected pin is also rendered as a native MapLibre marker anchored to longitude/latitude above the WebGL canvas. It should remain above 3D layers, retain a fixed screen size while zooming, and leave the viewport when the map is panned away from its coordinate.

If two pins appear, verify that no WebGL `selected-point` symbol/circle layer remains. The application should render exactly one native marker. The radius uses the `.analysis-radius-overlay` SVG.

### Search/provider/company issues

Use a clear Thai location or click the map if Nominatim is unavailable. Partial analysis is expected when a provider fails; TomTom needs a key and some providers are asynchronous/shared. An empty company dashboard is correct until a Business API is configured with valid CORS and array or `{ "data": [] }` responses.

### Cleared tokens and local submissions

Refresh intentionally clears memory-only tokens. Do not move secrets to localStorage. Partner submissions are device/browser-local and do not synchronize.

### Preferences and builds

Preferences require browser storage. First-run defaults are Thai and light. Use Node 22.13+, the Vercel build for Vercel, and the Vinext build for Sites. Fix the first real error before non-blocking chunk warnings and preserve user work.

If Vercel reports **Deployment Blocked** with no build log and identifies an invalid commit author email, the build never started. Configure a repository-local email verified by GitHub, create a new commit, and push it. This is an identity/configuration issue, not a Next.js compilation failure.

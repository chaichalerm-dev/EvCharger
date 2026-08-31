# Troubleshooting / การแก้ปัญหา

## ภาษาไทย

### แผนที่ว่างหรือ tile ไม่ขึ้น

ตรวจอินเทอร์เน็ตและ endpoint `osm-tiles` ใน Settings ถ้า public tile ไม่พร้อม fallback context ควรยังให้เลือกจุดได้ ตรวจ browser console เฉพาะ error ที่เกี่ยวข้องและอย่าลบ attribution หรือเปลี่ยนเป็น provider ที่ไม่อนุญาต

### กด 3D แล้วดูแบน

ซูมเข้าใกล้ selected point ตรวจสถานะ 3D พื้นที่กรุงเทพฯ อาจราบจริง Terrain-only หมายถึง DEM พร้อมแต่ไม่มี building geometry/height ที่ใช้ได้ ตรวจ Mapterhorn และ OpenFreeMap connection แยกกัน

### Marker บังพื้นที่เมื่อซูมออก

ตรวจ `MAP_MARKER_STYLE` และ zoom expression ห้ามใช้ DOM/CSS scale ที่ผูกกับ perspective โดยไม่ cap Cluster ควรทำงาน และ icon ต้อง viewport-aligned

### เลือกพิกัดแล้วไม่เห็นหมุดหรือวงรัศมี

ตรวจว่า source `selected-point` และ `analysis-radius` ถูกสร้างหลัง `style.load` แล้ว การอัปเดต GeoJSON ห้ามรอ `map.isStyleLoaded()` เพราะ raster tile ที่ยังโหลดอาจทำให้ค่านี้เป็น false ทั้งที่ source พร้อมเขียนแล้ว ให้ตรวจ source ด้วย `map.getSource()` โดยตรงและแยกความพร้อมของ layer ออกจากความพร้อมของข้อมูล tile ภายนอก

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

Verify capped zoom expressions, clustering, and viewport alignment. Avoid unbounded DOM/perspective scaling.

### A selected coordinate has no visible pin or radius

Confirm that `selected-point` and `analysis-radius` are created after `style.load`. Do not gate GeoJSON updates on `map.isStyleLoaded()`: pending raster tiles can keep it false even when the custom sources are writable. Check the required source with `map.getSource()` and treat custom-layer readiness separately from external tile readiness.

### Search/provider/company issues

Use a clear Thai location or click the map if Nominatim is unavailable. Partial analysis is expected when a provider fails; TomTom needs a key and some providers are asynchronous/shared. An empty company dashboard is correct until a Business API is configured with valid CORS and array or `{ "data": [] }` responses.

### Cleared tokens and local submissions

Refresh intentionally clears memory-only tokens. Do not move secrets to localStorage. Partner submissions are device/browser-local and do not synchronize.

### Preferences and builds

Preferences require browser storage. First-run defaults are Thai and light. Use Node 22.13+, the Vercel build for Vercel, and the Vinext build for Sites. Fix the first real error before non-blocking chunk warnings and preserve user work.

If Vercel reports **Deployment Blocked** with no build log and identifies an invalid commit author email, the build never started. Configure a repository-local email verified by GitHub, create a new commit, and push it. This is an identity/configuration issue, not a Next.js compilation failure.

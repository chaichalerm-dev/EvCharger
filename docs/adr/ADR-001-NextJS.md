# ADR-001: Next.js and TypeScript / Next.js และ TypeScript

- **Status / สถานะ:** Accepted / ยอมรับแล้ว
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

ต้นแบบต้องมี routing หลายหน้า responsive UI, code splitting, Vercel deployment และโครงสร้างที่ขยายไป backend ได้ ทีมต้องการภาษาเดียวกับ domain/config/service และตรวจ type ก่อน deploy

### การตัดสินใจ

ใช้ Next.js App Router, React และ strict TypeScript เป็น frontend หลัก ใช้ Tailwind/CSS และ component library ตามความเหมาะสม Framework-specific behavior อยู่ที่ `app/` และ provider/layout boundary ตรรกะธุรกิจอยู่ใน pure TypeScript service

คงเส้นทาง Vinext/Sites สำหรับ artifact ที่เข้ากันกับ Cloudflare Worker พร้อมตรวจ Next.js/Vercel แยกด้วย `build:vercel`

### ผลกระทบ

- ได้ file-based routing, lazy chunks และ ecosystem ที่เหมาะกับ Vercel
- Domain/service ใช้ type เดียวกับ UI ลด mapping error
- Client-only library เช่น MapLibre ต้อง lazy load และระวัง hydration
- ต้องตรวจสอง build target และหลีกเลี่ยง Node-only API ใน Sites runtime
- Framework migration ในอนาคตยังทำได้เพราะ domain/service ไม่ผูก Next.js มาก

### ทางเลือก

Vite SPA ง่ายกว่าแต่ routing/metadata/deployment path ต้องประกอบเพิ่ม Remix/Nuxt ไม่ตรง ecosystem/ภาษาเดิม การทำ backend-first เพิ่ม infrastructure ก่อนพิสูจน์ UX

## English

### Context and decision

The prototype needs multi-route responsive UI, code splitting, Vercel deployment, and typed business modules. Use Next.js App Router, React, and strict TypeScript. Keep framework concerns in `app/` boundaries and business logic in pure services. Retain a Vinext/Sites target while validating Next.js/Vercel separately.

### Consequences and alternatives

The choice provides routing, ecosystem, and shared types, but requires careful client-library loading, hydration discipline, dual-build validation, and Worker compatibility. Vite SPA, other full-stack frameworks, and a backend-first approach were considered but added routing, ecosystem, or infrastructure trade-offs without improving the first prototype objective.

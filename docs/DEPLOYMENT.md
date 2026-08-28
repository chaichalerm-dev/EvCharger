# Deployment / การติดตั้งและเผยแพร่

## ภาษาไทย

### เป้าหมายที่รองรับ

โปรเจกต์ตรวจสองเส้นทางการ build:

- **Vercel:** Next.js production build ผ่าน `npm run build:vercel`
- **Sites/Vinext:** Cloudflare Worker-compatible output ผ่าน `npm run build`

Core demo ไม่ต้องมี database, backend หรือ paid API key ใช้ Node.js 22.13 หรือใหม่กว่า

### เตรียมก่อน deploy

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run build:vercel
```

ตรวจว่าไม่มี `.env`, token, personal submission, `.next`, `dist`, test report หรือ temporary archive ถูก commit ตรวจ `.env.example` ให้มีเฉพาะ placeholder ในอนาคต

### Vercel

1. Import Git repository
2. ใช้ Node 22.13+
3. `vercel.json` เลือก Next.js และ `npm run build:vercel`
4. ตั้ง `NEXT_PUBLIC_APP_ORIGIN` เป็น trusted absolute origin เมื่อต้องใช้ metadata/redirect ที่อ้างโดเมน
5. ตั้ง optional public configuration ใน dashboard เท่านั้น
6. ห้ามใส่ production secret ในตัวแปร `NEXT_PUBLIC_*`

### Sites/Vinext

`.openai/hosting.json` เก็บเฉพาะ project ID และ logical binding ที่อนุญาต Build artifact ต้องมี `dist/server/index.js` และ hosting metadata การเผยแพร่ต้องอ้าง commit ที่ตรงกับ artifact ที่ตรวจแล้ว ห้ามแพ็ก source tree แทน build output

### Runtime configuration

Core map analysis ใช้ค่า provider default ที่ไม่ต้องมี key ผู้ใช้เพิ่ม eligible client key ในหน้า Settings ชั่วคราวได้ Production provider secret ต้องตั้งฝั่ง backend/BFF ไม่ใช่ environment ที่ถูก bundle ไป browser

### Smoke test หลัง deploy

1. หน้าแรกโหลดภาษาไทยและ light mode ครั้งแรก
2. Sidebar/mobile drawer ใช้งานได้
3. `/map` แสดง basemap หรือ fallback, search, click, radius และ Analyze
4. 2D/3D และ recenter icon ทำงาน
5. Layer controls และ legend แบบพับได้ทำงาน
6. Partial provider error ไม่ crash
7. ภาษา/theme สลับและคงค่าตามที่ออกแบบ
8. Company screen แสดง empty/error state เมื่อยังไม่ตั้ง Business API
9. Partner submission แสดงคำเตือน local prototype persistence

### Rollback และ observability

เก็บ deployment/version ก่อนหน้าเพื่อ rollback ตรวจ client error, provider failure, latency, quota และ build health Production ควรมี release note, owner, timestamp และ rollback criteria ชัดเจน

---

## English

### Supported targets

The project validates Vercel through `npm run build:vercel` and Sites/Vinext through `npm run build`. The core demo requires no database, backend, or paid key. Node.js 22.13 or later is required.

### Pre-deployment

Run clean install, typecheck, lint, unit tests, E2E, and both builds. Confirm that environment files, tokens, personal submissions, build output, reports, and temporary archives are not committed. `.env.example` contains placeholders only.

### Vercel

Import the repository, select Node 22.13+, and use the configured Next.js build. Set a trusted absolute application origin when metadata or redirects require one. Never expose a production secret through `NEXT_PUBLIC_*`.

### Sites/Vinext

Hosting metadata contains only the project ID and permitted logical bindings. The package must contain validated build output and reference the matching pushed commit. Never package the source tree as the runtime artifact.

### Runtime configuration and smoke testing

The key-free provider defaults support core analysis. Eligible client keys may be entered temporarily in Settings. Confidential provider credentials belong behind a backend/BFF. After deployment, test first-run language/theme, navigation, map/fallback, search/radius/analysis, 2D/3D, layers/legend, partial failure, settings, honest company empty states, and local-submission warnings.

### Rollback and observability

Retain previous deployment versions. Monitor client errors, provider failures, latency, quota, and build health. Production releases require an owner, timestamp, notes, rollback criteria, and an exercised rollback path.

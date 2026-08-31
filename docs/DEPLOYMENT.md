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

#### Git author ที่ Vercel ยอมรับ

Vercel อาจบล็อก deployment ก่อนเริ่ม build หากอีเมลผู้เขียน commit ไม่เชื่อมกับบัญชี GitHub ที่มีสิทธิ์ในโปรเจกต์ ตรวจด้วย `git show --no-patch --format="%an <%ae>" HEAD` และตั้งค่าเฉพาะ repository ด้วยอีเมล GitHub ที่ยืนยันแล้ว:

```bash
git config --local user.name "Your GitHub Name"
git config --local user.email "your-verified-github-email@example.com"
```

อย่าใช้ placeholder เช่น `sites@openai.local` สำหรับ commit ที่ต้อง trigger Vercel Git deployment หลังแก้ค่าแล้วต้องสร้าง commit ใหม่และ push; การแก้ configuration เพียงอย่างเดียวไม่เปลี่ยนผู้เขียนของ commit เก่า

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
10. `curl -I` ที่โดเมนจริงพบ CSP, HSTS, `nosniff`, anti-framing, Referrer Policy และ Permissions Policy
11. CSP ของ production มี nonce และไม่มี `unsafe-inline`/`unsafe-eval` ใน `script-src`

### SecurityHeaders.com

สแกนได้เฉพาะโดเมนที่ระบบภายนอกเข้าถึง response ของแอปได้ หาก deployment เป็น owner-only เครื่องมือจะเห็น `401` หรือหน้า sign-in ของ hosting gateway และคะแนนนั้นไม่ใช่คะแนนของตัวแอป ห้ามเปลี่ยนเว็บไซต์เป็น public เพียงเพื่อสแกนโดยไม่ได้รับอนุมัติจากเจ้าของ

สำหรับโดเมน public ให้เปิด `https://securityheaders.com/` ใส่ URL เต็ม เปิด follow redirects และตรวจว่าหน้า root กับ route สำคัญใช้ชุด header เดียวกัน คะแนน A+ เป็นเพียงผลของ HTTP response header ไม่ใช่การรับรองความปลอดภัยทั้งระบบ

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

Vercel can block a deployment before the build starts when the commit author email is not associated with a GitHub account that has project access. Check the current author with `git show --no-patch --format="%an <%ae>" HEAD`, set repository-local `user.name` and a verified GitHub `user.email`, then create and push a new commit. Changing Git configuration alone does not rewrite an existing commit. Do not use placeholder identities such as `sites@openai.local` for commits intended to trigger Vercel Git deployments.

### Sites/Vinext

Hosting metadata contains only the project ID and permitted logical bindings. The package must contain validated build output and reference the matching pushed commit. Never package the source tree as the runtime artifact.

### Runtime configuration and smoke testing

The key-free provider defaults support core analysis. Eligible client keys may be entered temporarily in Settings. Confidential provider credentials belong behind a backend/BFF. After deployment, test first-run language/theme, navigation, map/fallback, search/radius/analysis, 2D/3D, layers/legend, partial failure, settings, honest company empty states, local-submission warnings, and the production security-header set. Production `script-src` must carry a nonce and contain neither `unsafe-inline` nor `unsafe-eval`.

### SecurityHeaders.com

An external scanner can grade only an application response it can reach. On an owner-only deployment it may receive a `401` or hosting sign-in gateway, which is not the application's header result. Never make a deployment public solely for scanning without owner approval. For a public domain, scan the full URL with redirects enabled and verify both the root and representative routes. An A+ is a response-header grade, not a whole-system security certification.

### Rollback and observability

Retain previous deployment versions. Monitor client errors, provider failures, latency, quota, and build health. Production releases require an owner, timestamp, notes, rollback criteria, and an exercised rollback path.

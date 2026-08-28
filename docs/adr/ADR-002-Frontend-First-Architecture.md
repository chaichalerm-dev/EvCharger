# ADR-002: Frontend-First Architecture / สถาปัตยกรรม Frontend-First

- **Status / สถานะ:** Accepted / ยอมรับแล้ว
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

ต้องสาธิตคุณค่าต่อผู้บริหารและทดลอง flow วันนี้ โดยยังไม่มี requirement ที่นิ่งพอสำหรับ database/backend production การสร้าง infrastructure เต็มรูปแบบก่อนพิสูจน์ UX เพิ่มเวลาและต้นทุน

### การตัดสินใจ

สร้าง functional frontend prototype ก่อน แต่กำหนด domain, config, service, repository และ provider boundary ตั้งแต่ต้น Public location analysis ใช้ provider โดยตรงตามข้อจำกัดที่ประกาศ Company data ใช้ optional Business API และ prototype submission ใช้ local repository ที่ระบุชัด

### Invariant

- UI ไม่ import market fixture
- Business logic ไม่อยู่ใน page/component
- Data access เปลี่ยน implementation หลัง interface ได้
- Unknown/Estimated ไม่ถูกนำเสนอเป็น Verified
- Production security ไม่ถูกจำลองด้วย fake auth

### ผลกระทบ

สาธิตได้เร็วและเปลี่ยน backend ภายหลังโดยรักษา feature UI แต่ต้นแบบไม่มี multi-user consistency, secure secret, audit หรือ authoritative GIS สิ่งเหล่านี้เป็น production phase ไม่ใช่คุณสมบัติที่อ้างว่ามีแล้ว

### ทางเลือก

Backend/database-first ถูกเลื่อนเพราะยังไม่จำเป็น Static mock-only map ถูกปฏิเสธใน runtime หลังเปลี่ยนเป็น Real Provider Mode เพราะผู้ใช้ต้องวิเคราะห์ตำแหน่งจริง

## English

### Context and decision

Stakeholders need a usable decision journey before backend requirements stabilize. Build a functional frontend first while defining domain, configuration, service, repository, and provider boundaries. Public analysis uses declared providers; company records use an optional Business API; explicitly labelled prototype submissions use local persistence.

### Consequences

The product demonstrates quickly and can swap implementations without rebuilding feature UI. It does not provide multi-user consistency, confidential server secrets, trusted audit, or authoritative GIS. Those remain explicit production work. A backend-first implementation and a runtime mock-only map were rejected for the current phase.

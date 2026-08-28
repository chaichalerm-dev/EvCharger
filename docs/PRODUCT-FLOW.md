# Product Flow / ขั้นตอนการใช้งานผลิตภัณฑ์

## ภาษาไทย

### เป้าหมายของ flow

ผู้ใช้ที่ไม่รู้ GIS ควรเข้าใจได้ทันทีว่าต้องเลือกพื้นที่ กำหนดขอบเขต วิเคราะห์ อ่านเหตุผล แล้วค่อยเปรียบเทียบหรือสร้างโอกาสทางธุรกิจ ระบบจึงจัดลำดับจากคำถามง่ายไปสู่รายละเอียดเชิงวิเคราะห์

### เส้นทางหลัก

```text
หน้าเริ่มต้น
→ สำรวจแผนที่
→ ค้นหาหรือคลิกพื้นที่
→ เลือกรัศมีและระบุพื้นที่ว่าง
→ วิเคราะห์พื้นที่นี้
→ อ่านคะแนน คำแนะนำ เหตุผล ความเสี่ยง และข้อมูลที่ขาด
→ เปรียบเทียบพื้นที่
→ ตรวจโอกาส/พันธมิตร/สาขา
→ สำรวจพื้นที่จริงและตัดสินใจทางธุรกิจ
```

1. **เริ่มต้น:** หน้าแรกบอกว่าระบบทำอะไร มีผลลัพธ์อะไร และมีปุ่มหลักไปแผนที่
2. **เลือกทำเล:** ค้นหาสถานที่ในประเทศไทยหรือคลิกตำแหน่งบนแผนที่
3. **กำหนดบริเวณ:** เลือก 1/3/5/10 กม. และกรอกพื้นที่ว่างถ้าทราบ
4. **เรียกข้อมูล:** กดวิเคราะห์เพื่อเรียก provider ที่เปิดใช้งาน การเลือกจุดเพียงอย่างเดียวไม่อ้างว่าข้อมูลพร้อมแล้ว
5. **อ่านผล:** ดู overall score, factor bars, recommendation, station type, reasons, risks และ missing information
6. **ตรวจคุณภาพ:** แยก Verified, Estimated, Approximate, Unverified และข้อมูลที่ต้องสำรวจ
7. **เปรียบเทียบ:** เลือกหลายพื้นที่และใช้ configuration version เดียวกัน
8. **ดำเนินธุรกิจ:** สร้างหรือทบทวน opportunity, partner และ branch โดยยืนยัน action สำคัญ
9. **ยืนยันภาคสนาม:** ตรวจไฟฟ้า น้ำท่วม ทางเข้าออก กรรมสิทธิ์ ราคา และข้อกฎหมายก่อนอนุมัติจริง

### เส้นทางพันธมิตร

```text
ส่งพื้นที่ → Validate → บันทึกเฉพาะอุปกรณ์ต้นแบบ
→ วิเคราะห์ → ให้คะแนน → คำแนะนำ → เจ้าหน้าที่ทบทวน
```

Production ต้องเพิ่ม authentication, ownership, consent/privacy notice, private upload, malware scan, backend validation, audit log และ notification

### เส้นทางเมื่อข้อมูลไม่พร้อม

- Search ล้มเหลว: คงจุดเดิมและแสดง error ที่แก้ไขได้
- Provider บางตัวล้มเหลว: ใช้ผลจาก provider ที่สำเร็จและระบุข้อมูลที่หาย
- Company API ไม่พร้อม: แสดง empty/error state ไม่เติมข้อมูลสมมติ
- ข้อมูลสำคัญไม่ทราบ: แสดง `Unknown` หรือ `Requires Site Survey`
- ความเสี่ยงวิกฤต: override recommendation แม้คะแนนรวมสูง

---

## English

### Flow objective

A user without GIS expertise should immediately understand that they select an area, set a boundary, analyze, read the rationale, and only then compare or create a business opportunity. The product moves from a simple question to progressively deeper evidence.

### Primary journey

```text
Start
→ Explore map
→ Search or click a location
→ Select radius and optional available area
→ Analyze this area
→ Review score, recommendation, reasons, risks, and gaps
→ Compare locations
→ Review opportunities/partners/branches
→ Conduct survey and make a business decision
```

1. **Start:** explain the product, expected outputs, and one primary map action.
2. **Select:** search within Thailand or click the map.
3. **Scope:** choose 1/3/5/10 km and enter area if known.
4. **Request context:** explicit Analyze action calls enabled providers; selecting a point alone does not claim analysis is ready.
5. **Interpret:** review overall score, factor bars, recommendation, station type, reasons, risks, and missing information.
6. **Check quality:** distinguish Verified, Estimated, Approximate, Unverified, and survey-required data.
7. **Compare:** evaluate multiple sites under the same configuration version.
8. **Operate:** review opportunity, partner, and branch records with confirmations for consequential actions.
9. **Verify:** confirm power, flood, access, ownership, price, and legal constraints before real approval.

### Partner journey

```text
Submit → Validate → Device-local prototype persistence
→ Analyze → Score → Recommend → Staff review
```

Production adds authentication, ownership, privacy notices, private uploads, malware scanning, backend validation, audit logs, and notifications.

### Unavailable-data journey

- Search failure preserves the current point and exposes a recoverable error.
- Partial provider failure keeps successful results and identifies missing context.
- A disconnected Company API shows an honest empty/error state.
- Unknown critical facts render as `Unknown` or `Requires Site Survey`.
- Critical risk may override a high numerical score.

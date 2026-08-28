# Business Logic / ตรรกะธุรกิจ

## ภาษาไทย

### การสร้างปัจจัยวิเคราะห์

Location analysis รับพิกัด รัศมี พื้นที่ว่าง และบริบทจาก provider แล้วสร้าง Site domain object ปัจจัยทุกตัวอยู่ในช่วง 0–100 การคำนวณต้อง deterministic สำหรับ input และ configuration เดียวกัน และไม่เปลี่ยน missing value ให้เป็น verified fact

### การเลือกประเภทสถานี

Recommendation engine เปรียบเทียบ `areaSqm` กับ `STATION_CONFIGURATIONS`:

- ต่ำกว่า 350 ตร.ม. หรือไม่ทราบพื้นที่: Charging Point เป็นค่าเริ่มต้นสำหรับการคัดกรอง
- ตั้งแต่ 350 ตร.ม.: EV Hub
- ตั้งแต่ 900 ตร.ม.: Full EV Station
- เมื่อมี high flood risk: station recommendation ถูกเปลี่ยนเป็น Requires Site Survey

ผลพื้นที่ต้องแสดงว่า Estimated หรือ Verified แยกจากความเหมาะสมของขนาด

### Recommendation

1. คำนวณ overall weighted score
2. เลือก recommendation band ตาม threshold
3. ตรวจ critical risk override
4. เลือก station type ตามพื้นที่
5. สร้าง reasons จาก demand, access, competition และ area
6. สร้าง risks จาก flood, electrical capacity และ area verification
7. สร้าง missing information เช่น transformer capacity, ownership และ commercial terms

High flood risk ส่งผลเป็น `REQUIRES_INVESTIGATION` และ `REQUIRES_SITE_SURVEY` แม้ numerical score สูง การ override แสดงด้วย `overridden: true`

### Opportunity lifecycle

```text
LEAD → SUBMITTED → UNDER_ANALYSIS → QUALIFIED → SITE_SURVEY
→ APPROVED → CONTRACT → CONSTRUCTION → INSTALLED → OPERATIONAL
```

`REJECTED` เป็นสถานะปลายทางทางเลือก Action อนุมัติ ปฏิเสธ ลบ หรือเปลี่ยน config ต้องมี confirmation UX ระบบ backend ในอนาคตต้องตรวจ transition, permission และ audit independently

### Business model

รองรับ Company-Owned, Franchise, Partner/Host และ Existing Branch Expansion Partner อาจเป็น landowner, host, franchise, commercial partner หรือ strategic partner หนึ่ง partner มีหลาย branch และแต่ละ branch ต้องถูกประเมินแยก

### Financial simulation

ฐานตัวอย่างในโค้ด:

| ประเภท | เงินลงทุน | รายได้ฐาน/เดือน | ค่าใช้จ่าย/เดือน |
| --- | ---: | ---: | ---: |
| Charging Point | 850,000 บาท | 65,000 บาท | 22,000 บาท |
| EV Hub | 4,200,000 บาท | 310,000 บาท | 102,000 บาท |
| Full EV Station | 11,500,000 บาท | 790,000 บาท | 285,000 บาท |

Demand multiplier คือ `0.65 + demandScore / 250` รายได้ต่อเดือนถูกปัดเป็นจำนวนเต็ม Cash flow ขั้นต้นคือรายได้ลบ operating cost จากนั้นคำนวณ annual ROI และ payback สูตรนี้เป็น simulation สำหรับสาธิต ไม่ใช่ผลรับประกัน

---

## English

### Analysis-factor generation

Location analysis accepts coordinates, radius, optional area, and provider context, then builds a Site domain object. Factors are normalized to 0–100. The same inputs and configuration produce deterministic results. Missing values never become verified facts.

### Station selection

The recommendation engine compares `areaSqm` with `STATION_CONFIGURATIONS`:

- Below 350 m² or unknown: Charging Point is the screening default.
- At least 350 m²: EV Hub.
- At least 900 m²: Full EV Station.
- High flood risk changes station output to Requires Site Survey.

Area quality remains independently labelled Estimated or Verified.

### Recommendation sequence

1. Calculate weighted overall score.
2. Select the threshold band.
3. Evaluate critical overrides.
4. Select station type from area.
5. Generate reasons from demand, access, competition, and area.
6. Generate risks from flood, power, and area verification.
7. Generate gaps such as transformer capacity, ownership, and commercial terms.

High flood risk returns `REQUIRES_INVESTIGATION` and `REQUIRES_SITE_SURVEY` even with a strong numerical score, with `overridden: true`.

### Opportunity lifecycle and business models

The lifecycle and business models are listed above. Approval, rejection, deletion, and configuration changes require confirmation UX. A future backend independently enforces transitions, permission, and audit. Every partner branch is evaluated separately.

### Financial simulation

The table above documents current demo bases. Revenue multiplier is `0.65 + demandScore / 250`. Gross monthly cash is revenue minus operating cost; annual ROI and payback follow deterministically. This is a demonstration estimate, not a guaranteed financial result.

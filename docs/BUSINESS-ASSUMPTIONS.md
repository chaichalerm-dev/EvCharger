# Business Assumptions / สมมติฐานทางธุรกิจ

## ภาษาไทย

### วัตถุประสงค์

สมมติฐานในต้นแบบมีไว้เพื่อสาธิตกระบวนการคัดกรองและเปรียบเทียบทำเล ไม่ใช่มาตรฐานวิศวกรรม นโยบายลงทุน หรือข้อมูลรับรองความเป็นไปได้ เจ้าของธุรกิจต้องอนุมัติและ version สมมติฐานก่อนใช้ตัดสินใจจริง

### สมมติฐานด้านทำเล

- Demand, competition opportunity, accessibility, POI, infrastructure readiness, flood safety, site area และ business potential มีผลต่อความน่าสนใจของพื้นที่
- คะแนน competition สูงหมายถึงเงื่อนไขการแข่งขันเอื้อต่อโอกาส ไม่ใช่จำนวนคู่แข่งสูง
- คะแนน flood risk สูงหมายถึงปลอดภัยกว่า เพราะเป็น safety-oriented score
- Population, EV adoption และ traffic ที่ไม่ได้วัดจริงเป็น estimated context
- พื้นที่และที่จอดรถจาก public source เป็นค่าประมาณจนกว่าจะสำรวจ
- Unknown power capacity, transformer distance, ownership และ commercial terms ไม่ถูกนับเป็นข้อดี

### สมมติฐานประเภทสถานี

| ประเภท | พื้นที่ขั้นต่ำใน demo | พื้นที่แนะนำ | จำนวนหัวชาร์จตัวอย่าง |
| --- | ---: | ---: | ---: |
| Charging Point | 80 ตร.ม. | 150 ตร.ม. | 2–4 |
| EV Hub | 350 ตร.ม. | 500 ตร.ม. | 6–14 |
| Full EV Station | 900 ตร.ม. | 1,400 ตร.ม. | 12–30 |

ค่าดังกล่าวเป็น planning example เท่านั้น ต้องตรวจ turning radius, bay geometry, fire safety, accessibility, utility equipment, drainage, queueing, retail space และกฎหมายท้องถิ่น

### สมมติฐานทางการเงิน

Simulation ใช้ฐานลงทุน รายได้ต่อเดือน และค่าใช้จ่ายดำเนินงานคงที่ตามประเภทสถานี แล้วปรับรายได้ด้วย demand score สูตรไม่รวม VAT, ภาษีเงินได้นิติบุคคล, financing, depreciation, battery/storage, demand charge, degradation, tariff escalation, land acquisition, lease escalation, downtime หรือ ancillary revenue ทั้งหมด

### สิ่งที่ต้องอนุมัติก่อน production

Business owner ต้องอนุมัติ factor definition, weights, thresholds, critical overrides, station footprints, charger mix, CAPEX/OPEX, tariff, utilization curve, lease/franchise economics, tax, financing, data confidence, staleness และ governance ร่วมกับทีมพาณิชย์ วิศวกรรมไฟฟ้า GIS น้ำท่วม การเงิน กฎหมาย และปฏิบัติการ

---

## English

### Purpose

Prototype assumptions demonstrate site screening and comparison. They are not engineering standards, investment policy, or feasibility certification. Business owners must approve and version assumptions before operational use.

### Location assumptions

- Demand, favorable competitive conditions, accessibility, POI coverage, infrastructure readiness, flood safety, site area, and business potential contribute to attractiveness.
- A high competition factor means favorable competitive opportunity, not a high raw competitor count.
- A high flood-risk factor means safer conditions because the factor is safety-oriented.
- Population, EV adoption, and unmeasured traffic are estimated context.
- Public-source area and parking remain estimates until surveyed.
- Unknown power, transformer distance, ownership, and commercial terms are never counted as advantages.

### Station assumptions

The table above lists demo minimum area, recommended area, and charger ranges. They are planning examples. Real design validates turning radius, bay geometry, fire safety, accessibility, utility equipment, drainage, queueing, retail space, and local regulation.

### Financial assumptions

The simulation starts from fixed investment, monthly revenue, and operating-cost examples per station type and adjusts revenue with demand score. It does not fully model VAT, corporate tax, financing, depreciation, battery/storage, demand charges, degradation, tariff escalation, land acquisition, lease escalation, downtime, or ancillary revenue.

### Production approval

Business owners must approve factor definitions, weights, thresholds, critical overrides, footprints, charger mix, CAPEX/OPEX, tariff, utilization, lease/franchise economics, tax, financing, confidence, staleness, and governance with commercial, electrical, GIS, flood, finance, legal, and operations teams.

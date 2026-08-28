# Scoring and Recommendation / การให้คะแนนและคำแนะนำ

## ภาษาไทย

### สูตร

Scoring engine เป็น pure TypeScript module และคำนวณ:

```text
overall = round(Σ factorScore × factorWeight)
```

ทุก factor อยู่ในช่วง 0–100 น้ำหนักรวมเท่ากับ 1.00 ผลลัพธ์มี `calculatedAt` และ `configurationVersion: demo-v1.0`

| ปัจจัย | น้ำหนัก | ความหมายของคะแนนสูง |
| --- | ---: | --- |
| Demand | 20% | ความต้องการโดยประมาณสูง |
| Competition | 14% | เงื่อนไขการแข่งขันเอื้อต่อโอกาส |
| Accessibility | 16% | เข้าถึงได้สะดวก |
| POI | 12% | มี destination/กิจกรรมรอบพื้นที่ |
| Infrastructure | 14% | ความพร้อมโครงสร้างพื้นฐานสูงกว่า |
| Flood Risk | 10% | ปลอดภัยจากความเสี่ยงมากกว่า |
| Site Area | 8% | พื้นที่รองรับรูปแบบสถานีได้ดี |
| Business Potential | 6% | ศักยภาพทางพาณิชย์สูงกว่า |

### เกณฑ์คะแนน

| คะแนน | ระดับ |
| ---: | --- |
| 90–100 | Excellent |
| 75–89 | High Potential |
| 60–74 | Potential |
| 40–59 | Low Potential |
| 0–39 | Not Recommended |

### Critical override

ถ้า Site มี `floodRisk: HIGH` ผล recommendation จะเป็น Requires Investigation และ station type เป็น Requires Site Survey โดยไม่สนใจว่า overall score อยู่ช่วงใด นี่เป็นตัวอย่างกฎป้องกันการให้คะแนนเฉลี่ยกลบความเสี่ยงวิกฤต

### วิธีอ่านผล

- คะแนนเป็นตัวชี้วัดเชิงเปรียบเทียบ ไม่ใช่ probability หรือ feasibility certificate
- Factor score ต้องอ่านพร้อม source, confidence และ verified status
- Infrastructure ต่ำอาจสะท้อนข้อมูลที่ยังไม่ยืนยัน ไม่ควรถูกตีความว่าไม่มีไฟฟ้าแน่นอน
- Flood factor สูงหมายถึงปลอดภัยกว่า ควรใช้ label ที่ชัดเจน
- Site ที่คะแนนใกล้กันควรเปรียบเทียบ risk, data gap และต้นทุนสำรวจ ไม่ใช่ดูอันดับอย่างเดียว

### Governance สำหรับ production

Config ต้องมี immutable version, owner, status, approvedAt, effectiveFrom/To, change reason และ regression result การเปลี่ยนน้ำหนักต้องมี preview ผลกระทบต่อ ranking, approval, audit log และ rollback ห้ามให้ frontend เป็นแหล่งอ้างอิงคะแนนเพียงแห่งเดียว

---

## English

### Formula

The scoring engine is a pure TypeScript module:

```text
overall = round(Σ factorScore × factorWeight)
```

Factors are normalized to 0–100 and weights sum to 1.00. Output includes `calculatedAt` and `configurationVersion: demo-v1.0`. The table above defines current weights and the meaning of a high score.

### Bands

90–100 is Excellent, 75–89 High Potential, 60–74 Potential, 40–59 Low Potential, and 0–39 Not Recommended.

### Critical override

`floodRisk: HIGH` changes the recommendation to Requires Investigation and the station output to Requires Site Survey regardless of overall band. This prevents an average from hiding a critical risk.

### Interpretation

- A score is a comparative indicator, not probability or feasibility certification.
- Read factor values with source, confidence, and verified status.
- Low infrastructure may reflect unverified information rather than confirmed absence of power.
- A high flood factor means safer conditions and requires clear labelling.
- Similar scores should be compared by risk, data gaps, and survey cost rather than rank alone.

### Production governance

Configurations require immutable versions, owner, status, approval time, effective dates, change reason, and regression results. Weight changes need ranking-impact preview, approval, audit, and rollback. The frontend must not be the sole scoring authority.

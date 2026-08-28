# ADR-007: Standalone Scoring and Recommendation / กลไกคะแนนและคำแนะนำแบบแยกอิสระ

- **Status / สถานะ:** Accepted / ยอมรับแล้ว
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

คะแนนมีผลต่อ ranking และการตัดสินใจ ถ้าฝังใน UI จะทดสอบยาก ซ้ำหลายหน้า และเปลี่ยนโดยไม่รู้ตัว Numerical average ยังอาจกลบ critical risk

### การตัดสินใจ

สร้าง pure deterministic TypeScript scoring engine และ recommendation engine แยกกัน Weight/threshold/station configuration อยู่ใน config Input/output ใช้ domain type ผล score มี configuration version Recommendation มี reasons, risks, missing information และ override flag

### กฎสำคัญ

- น้ำหนักรวม 1.00 และ factor อยู่ 0–100
- Flood factor สูงหมายถึงปลอดภัยกว่า
- High flood risk override band และ station type
- Unknown power ไม่ถูกนับเป็นข้อดี
- Area-based station selection แยกจาก area verification

### ผลกระทบ

ทุกหน้าคำนวณ consistent และ unit test ได้ แต่ client result ยังไม่ใช่ trusted production authority Backend ในอนาคตต้องใช้ config version เดียวกันหรือเป็นผู้คำนวณหลักพร้อม parity test การเปลี่ยน config ต้อง version/approve/audit

### ทางเลือก

คะแนนใน component ถูกปฏิเสธ Rule engine ภายนอกยังเกินความจำเป็น Machine-learning model ถูกเลื่อนเพราะอธิบายและ governance ยากกว่า และข้อมูลฝึกยังไม่มีคุณภาพพอ

## English

### Context and decision

Scores affect ranking and should not be duplicated in UI or allow averages to hide critical risk. Use separate pure deterministic TypeScript scoring and recommendation engines. Keep weights, thresholds, and station rules in configuration. Outputs include configuration version, rationale, risks, gaps, and override state.

### Consequences and alternatives

All screens remain consistent and unit-testable, but client output is not a trusted production authority. A future backend must share the version or become authoritative with parity tests and governed changes. Component logic was rejected; an external rule engine is premature; ML is deferred due explainability, governance, and data-readiness concerns.

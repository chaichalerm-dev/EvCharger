"use client";

import { useState } from "react";
import { Database, LockKeyhole, SlidersHorizontal, Zap } from "lucide-react";
import { SCORE_THRESHOLDS, SCORE_WEIGHTS, STATION_CONFIGURATIONS } from "@/src/config/business";
import { useApp } from "@/src/store/app-context";
import { ConfirmDialog } from "@/src/components/dialogs/confirm-dialog";

export function AnalysisView() {
  const [confirm, setConfirm] = useState(false);
  const { hasPermission, language } = useApp();
  const th = language === "th";

  return <main className="page">
    <div className="page-head">
      <div>
        <div className="eyebrow">{th ? "ข้อมูลเชิงลึกที่อธิบายได้" : "Explainable intelligence"}</div>
        <h1>{th ? "หลักการให้คะแนนและเลือกประเภทสถานี" : "Scoring & Station Logic"}</h1>
        <p className="page-subtitle">{th ? "การตั้งค่าที่โปร่งใสและใช้กับการวิเคราะห์ต้นแบบทุกครั้ง" : "Transparent configuration used by every prototype analysis"}</p>
      </div>
      {/* แม้มีสิทธิ์ MANAGE_CONFIG กล่องยืนยันด้านล่างก็แค่รับทราบคำเตือน ไม่ได้แก้ไข SCORE_WEIGHTS/
          threshold จริง — ตาม AI.md §4 การเปลี่ยนน้ำหนักคะแนนต้องมีเหตุผลบันทึกไว้และมี test ไม่ใช่แก้ผ่านหน้านี้ */}
      {hasPermission("MANAGE_CONFIG")
        ? <button className="btn" onClick={() => setConfirm(true)}><SlidersHorizontal />{th ? "เปลี่ยนการตั้งค่า" : "Change configuration"}</button>
        : <span className="btn"><LockKeyhole />{th ? "ดูอย่างเดียว" : "View only"}</span>}
    </div>
    <div className="demo-banner"><Database />{th ? "การตั้งค่าต้นแบบ · การแก้ไขในระบบจริงต้องมีเวอร์ชัน การอนุมัติ การตรวจสอบ และ audit log" : "Demo configuration · Future changes require versioning, approval, validation, and audit logging."}</div>
    <div className="detail-grid">
      <section className="card section-card">
        <h2>{th ? "น้ำหนักของปัจจัยคะแนน" : "Weighted score factors"}</h2>
        <div className="score-factor-grid">{Object.entries(SCORE_WEIGHTS).map(([key, value]) => <div className="factor-card" key={key}><header><span>{key.replaceAll(/([A-Z])/g, " $1")}</span><strong>{Math.round(value * 100)}%</strong></header><div><b style={{ width: `${value * 100}%` }} /></div></div>)}</div>
        <h3>{th ? "ช่วงคะแนนคำแนะนำ" : "Recommendation thresholds"}</h3>
        {/* SCORE_THRESHOLDS เรียงจากช่วงคะแนนสูงสุดไปต่ำสุด ขอบบนของแต่ละช่วงจึงคำนวณจาก
            ค่าต่ำสุดของช่วงที่สูงกว่าลบ 1 */}
        <div className="info-grid">{SCORE_THRESHOLDS.map((item, index) => <div className="info-item" key={item.label}><span>{item.label.replaceAll("_", " ")}</span><strong>{item.min}–{index === 0 ? 100 : SCORE_THRESHOLDS[index - 1].min - 1}</strong></div>)}</div>
        <div className="callout warning" style={{ marginTop: 13 }}>{th ? "ความเสี่ยงร้ายแรงมีสิทธิ์แทนที่ช่วงคะแนน พื้นที่เสี่ยงน้ำท่วมสูงจะถูกแนะนำให้ตรวจสอบพื้นที่เพิ่มเติม แม้อุปสงค์และการเข้าถึงจะดี" : "Critical risks override score bands. A high flood risk produces “Requires Further Site Investigation” even when demand and access are strong."}</div>
      </section>
      <section className="card section-card">
        <h2>{th ? "รูปแบบสถานี" : "Station configurations"}</h2>
        {STATION_CONFIGURATIONS.map(item => <article className="setting-row" key={item.type}><div><strong><Zap size={12} style={{ display: "inline", marginRight: 5 }} />{item.label}</strong><span>{item.description}</span></div><div style={{ textAlign: "right" }}><strong>{item.recommendedAreaSqm} m²</strong><span>{item.chargerRange[0]}–{item.chargerRange[1]} {th ? "หัวชาร์จ" : "chargers"}</span></div></article>)}
      </section>
    </div>
    <ConfirmDialog
      open={confirm}
      title={th ? "เปลี่ยนการตั้งค่าคะแนนหรือไม่?" : "Change scoring configuration?"}
      description={th ? "การเปลี่ยนน้ำหนักอาจกระทบอันดับพื้นที่และการตัดสินใจทางธุรกิจ ต้นแบบนี้ไม่บันทึกการเปลี่ยนแปลง ส่วนระบบจริงต้องได้รับอนุมัติ มีเวอร์ชันใหม่ ทดสอบการถดถอย และมี audit log" : "Changing weights can materially alter site rankings and business decisions. This prototype does not persist changes; production changes require approval, a new configuration version, regression tests, and an audit log."}
      confirmLabel={th ? "รับทราบ" : "Acknowledge"}
      onCancel={() => setConfirm(false)}
      onConfirm={() => setConfirm(false)}
    />
  </main>;
}

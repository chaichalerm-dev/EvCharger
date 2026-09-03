"use client";

import Link from "next/link";
import { ClipboardList, Database, TriangleAlert } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { OPPORTUNITY_LIFECYCLE } from "@/src/config/business";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";

export function OpportunitiesView() {
  const { language } = useApp();
  const th = language === "th";
  // "opportunities" เป็นคนละ resource key กับ "sites" (ที่ dashboard/expansion/comparison ใช้)
  // แม้ทั้งคู่จะคืนค่าเป็น Site[] เหมือนกัน — ดู use-business-resource.ts
  const { data: sites, loading, error } = useBusinessResource<Site>("opportunities");
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "กระบวนการตัดสินใจ" : "Decision pipeline"}</div><h1>{th ? "วงจรโอกาสทางธุรกิจ" : "Opportunity Lifecycle"}</h1><p className="page-subtitle">{th ? "ติดตามโอกาสของบริษัทจาก REST API ที่ตั้งค่าไว้" : "Track company opportunities returned by the configured REST API"}</p></div></div>
    <div className="demo-banner"><Database /><strong>{th ? "มุมมอง API แบบอ่านอย่างเดียว" : "READ-ONLY API VIEW"}</strong> · {th ? "การตัดสินใจจริงต้องได้รับอนุญาตและบันทึกตรวจสอบโดยระบบหลังบ้าน" : "Decisions must be authorized and audited by the production backend."}</div>
    <section className="card" style={{ marginBottom: 13 }}><div className="lifecycle">{OPPORTUNITY_LIFECYCLE.map(status => <div className="life-step" key={status}><div className="life-dot" /><span>{status.replaceAll("_", " ")}</span></div>)}</div></section>
    <section className="card">{error ? <div className="status-card"><TriangleAlert /><strong>{th ? "ไม่สามารถเชื่อมต่อ Business API" : "Business API unavailable"}</strong><p>{error}</p></div> : loading ? <div className="status-card"><ClipboardList /><strong>{th ? "กำลังโหลดโอกาส…" : "Loading opportunities…"}</strong></div> : !sites.length ? <div className="status-card"><ClipboardList /><strong>{th ? "API ยังไม่ส่งข้อมูลโอกาสกลับมา" : "No opportunities returned"}</strong><p>{th ? "ตั้งค่า URL และโทเคน Business API ในหน้าการตั้งค่า โดย endpoint ที่คาดไว้คือ GET /opportunities" : "Set the Business API base URL and token in Settings. The expected endpoint is GET /opportunities."}</p><Link href="/settings#api-connections" className="btn">{th ? "ตั้งค่า API" : "Configure API"}</Link></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>{th ? "โอกาส" : "Opportunity"}</th><th>{th ? "รูปแบบธุรกิจ" : "Business model"}</th><th>{th ? "คะแนน" : "Score"}</th><th>{th ? "ขั้นตอนปัจจุบัน" : "Current stage"}</th><th>{th ? "สถานะข้อมูล" : "Data status"}</th></tr></thead><tbody>{sites.map(site => <tr key={site.id}><td><Link href={`/sites/${site.id}`}><strong>{site.name}</strong><span className="table-sub">{site.province}</span></Link></td><td>{site.businessModel.replaceAll("_", " ")}</td><td><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></td><td><span className={`badge ${site.opportunityStatus.toLowerCase()}`}>{site.opportunityStatus.replaceAll("_", " ")}</span></td><td>{site.provenance.verifiedStatus}</td></tr>)}</tbody></table></div>}</section>
  </main>;
}

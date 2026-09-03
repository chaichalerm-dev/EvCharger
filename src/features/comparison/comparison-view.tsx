"use client";

import Link from "next/link";
import { GitCompareArrows, HelpCircle, TriangleAlert } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { recommendSite } from "@/src/services/recommendation-engine";
import { useApp } from "@/src/store/app-context";

export function ComparisonView() {
  const { compareIds, toggleCompare, language } = useApp();
  const th = language === "th";
  const { data: sites, loading, error } = useBusinessResource<Site>("sites");
  // .slice(0, 4) ทำซ้ำขอบเขตที่ AppProvider.toggleCompare บังคับไว้แล้ว แต่ยังกันไว้ตรงนี้ด้วย
  // เพราะ compareIds อาจค้างอยู่แม้ site หายไปแล้ว (เช่น หลังเปลี่ยนการเชื่อมต่อ Business API)
  const selected = compareIds.map(id => sites.find(site => site.id === id)).filter((site): site is Site => Boolean(site)).slice(0, 4);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "พื้นที่ช่วยตัดสินใจ" : "Decision workspace"}</div><h1>{th ? "เปรียบเทียบพื้นที่" : "Compare Sites"}</h1><p className="page-subtitle">{th ? "เปรียบเทียบได้สูงสุด 4 พื้นที่จาก Business API ด้วยเกณฑ์คะแนนเดียวกัน" : "Compare up to four locations from your Business API using one scoring configuration"}</p></div><span className="btn"><GitCompareArrows />{selected.length} {th ? "พื้นที่ที่เลือก" : "selected"}</span></div>
    {error ? <div className="card status-card"><TriangleAlert /><strong>{th ? "ไม่สามารถเชื่อมต่อ Business API" : "Business API unavailable"}</strong><p>{error}</p></div> : loading ? <div className="card status-card"><HelpCircle /><strong>{th ? "กำลังโหลดพื้นที่ของบริษัท…" : "Loading company sites…"}</strong></div> : sites.length === 0 ? <div className="card status-card"><HelpCircle /><strong>{th ? "ยังไม่มีพื้นที่ให้เปรียบเทียบ" : "No company sites to compare"}</strong><p>{th ? "ตั้งค่า Business API หรือวิเคราะห์พื้นที่จากหน้าสำรวจแผนที่" : "Configure a Business API or analyze an area from Map Explorer."}</p><Link href="/settings#api-connections" className="btn">{th ? "ตั้งค่า API" : "Configure API"}</Link></div> : <>
      <div className="compare-picker">{sites.map(site => <button className={`compare-choice ${compareIds.includes(site.id) ? "selected" : ""}`} key={site.id} onClick={() => toggleCompare(site.id)}><strong>{site.name}</strong><span>{site.province} · Score {calculateSiteScore(site.factors).overall}</span></button>)}</div>
      {selected.length ? <section className="card"><div className="table-wrap"><table className="data-table"><thead><tr><th>{th ? "ปัจจัย" : "Factor"}</th>{selected.map(site => <th key={site.id}>{site.name}</th>)}</tr></thead><tbody>{["demand", "competition", "accessibility", "poi", "infrastructure", "floodRisk", "siteArea", "businessPotential"].map(factor => <tr key={factor}><td><strong>{factor.replaceAll(/([A-Z])/g, " $1")}</strong></td>{selected.map(site => <td key={site.id}>{site.factors[factor as keyof typeof site.factors]}</td>)}</tr>)}<tr><td><strong>{th ? "คะแนนรวม" : "Overall score"}</strong></td>{selected.map(site => <td key={site.id}><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></td>)}</tr><tr><td><strong>{th ? "คำแนะนำ" : "Recommendation"}</strong></td>{selected.map(site => <td key={site.id}>{recommendSite(site, calculateSiteScore(site.factors)).stationType.replaceAll("_", " ")}</td>)}</tr></tbody></table></div></section> : <div className="card status-card"><HelpCircle /><strong>{th ? "เลือกอย่างน้อย 1 พื้นที่" : "Select at least one site"}</strong><p>{th ? "เลือกพื้นที่บริษัทจากรายการด้านบน" : "Choose company sites above."}</p></div>}
    </>}
  </main>;
}

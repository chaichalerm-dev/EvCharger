"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Database, GitCompareArrows, MapPin, Search, TriangleAlert } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";

export function SiteList() {
  const [query, setQuery] = useState("");
  const { compareIds, toggleCompare, language } = useApp();
  const th = language === "th";
  // ช่องติ๊ก "เปรียบเทียบ" ผูกกับ toggleCompare ของ AppProvider โดยตรง — เกิน 4 รายการจะถูกเพิกเฉย
  // ที่ต้นทาง (ดูคอมเมนต์ใน app-context.tsx) ไม่ต้องกันซ้ำในหน้านี้
  const { data: sites, loading, error } = useBusinessResource<Site>("sites");
  const rows = useMemo(() => sites.filter(site => `${site.name}${site.province}${site.district}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => calculateSiteScore(b.factors).overall - calculateSiteScore(a.factors).overall), [query, sites]);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "กระบวนการคัดเลือกพื้นที่" : "Opportunity pipeline"}</div><h1>{th ? "พื้นที่โอกาส" : "Site Opportunities"}</h1><p className="page-subtitle">{th ? "ข้อมูลบริษัทจาก Business REST API ที่ตั้งค่าไว้" : "Company records loaded from the configured Business REST API"}</p></div><div className="head-actions"><Link className="btn" href="/compare"><GitCompareArrows />{th ? "เปรียบเทียบ" : "Compare"} ({compareIds.length})</Link><Link className="btn primary" href="/map"><MapPin />{th ? "ค้นหาบนแผนที่" : "Discover on map"}</Link></div></div>
    <div className="demo-banner"><Database /><strong>{th ? "ข้อมูลจาก BUSINESS API" : "BUSINESS API DATA"}</strong> · {th ? "ไม่มีการแสดงข้อมูลตัวอย่าง" : "No fixture records are shown."}</div>
    <div className="data-toolbar"><div className="field-search"><Search /><input aria-label={th ? "ค้นหาพื้นที่โอกาส" : "Search site opportunities"} value={query} onChange={event => setQuery(event.target.value)} placeholder={th ? "ค้นหาพื้นที่ เขต หรือจังหวัด" : "Search sites, districts or provinces"} /></div></div>
    <section className="card">{error ? <div className="status-card"><TriangleAlert /><strong>{th ? "ไม่สามารถเชื่อมต่อ Business API" : "Business API unavailable"}</strong><p>{error}</p><Link className="btn" href="/settings#api-connections">{th ? "ตรวจสอบการเชื่อมต่อ API" : "Check API connection"}</Link></div> : loading ? <div className="status-card"><Search /><strong>{th ? "กำลังโหลดข้อมูลบริษัท…" : "Loading company records…"}</strong></div> : !rows.length ? <div className="status-card"><Search /><strong>{th ? "ยังไม่มีพื้นที่โอกาสของบริษัท" : "No company opportunities available"}</strong><p>{th ? "ตั้งค่า Business API หรือใช้หน้าสำรวจแผนที่เพื่อวิเคราะห์พื้นที่สาธารณะได้ทันที" : "Configure the Business API, or use Map Explorer to analyze a public location immediately."}</p><Link className="btn primary" href="/map">{th ? "เปิดหน้าสำรวจแผนที่" : "Open Map Explorer"}</Link></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>{th ? "เปรียบเทียบ" : "Compare"}</th><th>{th ? "โอกาส" : "Opportunity"}</th><th>{th ? "จังหวัด / เขต" : "Province / District"}</th><th>{th ? "สถานะ" : "Status"}</th><th>{th ? "พื้นที่" : "Area"}</th><th>{th ? "น้ำท่วม" : "Flood"}</th><th>{th ? "คะแนน" : "Score"}</th></tr></thead><tbody>{rows.map(site => <tr key={site.id}><td><input aria-label={`${th ? "เปรียบเทียบ" : "Compare"} ${site.name}`} type="checkbox" checked={compareIds.includes(site.id)} onChange={() => toggleCompare(site.id)} /></td><td><Link href={`/sites/${site.id}`}><strong className="table-title">{site.name}</strong><span className="table-sub">{site.siteType} · {site.businessModel.replaceAll("_", " ")}</span></Link></td><td>{site.province}<span className="table-sub">{site.district}</span></td><td><span className={`badge ${site.opportunityStatus.toLowerCase()}`}>{site.opportunityStatus.replaceAll("_", " ")}</span></td><td>{site.areaSqm?.toLocaleString() ?? (th ? "ไม่ทราบ" : "Unknown")} m²</td><td>{site.floodRisk}</td><td><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></td></tr>)}</tbody></table></div>}</section>
  </main>;
}

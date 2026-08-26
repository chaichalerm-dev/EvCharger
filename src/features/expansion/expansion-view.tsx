"use client";

import Link from "next/link";
import { Database, TrendingUp, TriangleAlert } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";

export function ExpansionView() {
  const { language } = useApp();
  const th = language === "th";
  const { data: sites, loading, error } = useBusinessResource<Site>("sites");
  const scores = sites.map(site => calculateSiteScore(site.factors).overall);
  const stages = [
    [th ? "ทั้งหมด" : "Total", sites.length], [th ? "ศักยภาพสูง" : "High potential", scores.filter(score => score >= 75).length], [th ? "มีศักยภาพ" : "Potential", scores.filter(score => score >= 60 && score < 75).length],
    [th ? "อยู่ระหว่างพิจารณา" : "Under review", sites.filter(site => ["UNDER_ANALYSIS", "QUALIFIED", "SITE_SURVEY"].includes(site.opportunityStatus)).length], [th ? "อนุมัติแล้ว" : "Approved", sites.filter(site => site.opportunityStatus === "APPROVED").length],
    [th ? "กำลังก่อสร้าง" : "Construction", sites.filter(site => site.opportunityStatus === "CONSTRUCTION").length], [th ? "เปิดให้บริการ" : "Operational", sites.filter(site => site.opportunityStatus === "OPERATIONAL").length],
  ] as const;
  const ranked = [...sites].sort((a, b) => calculateSiteScore(b.factors).overall - calculateSiteScore(a.factors).overall);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "พอร์ตการเติบโต" : "Growth portfolio"}</div><h1>{th ? "แดชบอร์ดแผนการขยาย" : "Expansion Dashboard"}</h1><p className="page-subtitle">{th ? "ประเมินความพร้อมของพอร์ตจากข้อมูลบริษัทที่เชื่อมต่อเท่านั้น" : "Portfolio readiness calculated only from your connected company records"}</p></div></div>
    <div className="demo-banner"><Database /><strong>{th ? "ข้อมูลจาก BUSINESS API" : "BUSINESS API DATA"}</strong> · {th ? "ไม่มีการเติมยอดรวมตัวอย่าง" : "No illustrative portfolio totals are inserted."}</div>
    {error ? <div className="card status-card"><TriangleAlert /><strong>{th ? "ไม่สามารถเชื่อมต่อ Business API" : "Business API unavailable"}</strong><p>{error}</p></div> : loading ? <div className="card status-card"><TrendingUp /><strong>{th ? "กำลังโหลดพอร์ต…" : "Loading portfolio…"}</strong></div> : !sites.length ? <div className="card status-card"><TrendingUp /><strong>{th ? "ยังไม่ได้เชื่อมต่อพอร์ตการขยาย" : "No expansion portfolio connected"}</strong><p>{th ? "ตั้งค่า Business API หรือใช้หน้าสำรวจแผนที่เพื่อประเมินพื้นที่สาธารณะ" : "Configure the Business API, or use Map Explorer to evaluate a public location."}</p><Link className="btn" href="/settings#api-connections">{th ? "ตั้งค่า API" : "Configure API"}</Link></div> : <><div className="funnel-grid">{stages.map(([name, value]) => <article className="card funnel-card" key={name}><strong>{value}</strong><span>{name}</span></article>)}</div><section className="card"><div className="card-head"><div><h2>{th ? "ลำดับความสำคัญในการลงทุน" : "Investment priority"}</h2><p>{th ? "จัดอันดับจากข้อมูล Business API ปัจจุบัน" : "Ranked from current Business API records"}</p></div></div><div className="card-body rank-list">{ranked.map((site, index) => <Link href={`/sites/${site.id}`} className="rank-item" key={site.id}><span className="rank-no">{index + 1}</span><span><strong>{site.name}</strong><span>{site.businessModel.replaceAll("_", " ")} · {site.province}</span></span><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></Link>)}</div></section></>}
  </main>;
}

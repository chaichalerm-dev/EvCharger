"use client";

import Link from "next/link";
import {
  ArrowRight, BarChart3, CheckCircle2, CircleGauge, Compass, Database,
  MapPin, MapPinned, RefreshCw, Route, Search, Settings2, ShieldCheck, Sparkles, TrendingUp
} from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";

export function DashboardView() {
  const { language } = useApp();
  const th = language === "th";
  const { data: sites, loading, error, refresh } = useBusinessResource<Site>("sites");
  const scores = sites.map(site => calculateSiteScore(site.factors).overall);
  const metrics = [
    [th ? "พื้นที่ทั้งหมด" : "Total sites", sites.length, Compass],
    [th ? "ศักยภาพสูง" : "High potential", scores.filter(score => score >= 75).length, TrendingUp],
    [th ? "อยู่ระหว่างพิจารณา" : "Under review", sites.filter(site => ["UNDER_ANALYSIS", "QUALIFIED", "SITE_SURVEY"].includes(site.opportunityStatus)).length, CircleGauge],
    [th ? "อนุมัติแล้ว" : "Approved", sites.filter(site => site.opportunityStatus === "APPROVED").length, ShieldCheck],
  ] as const;
  const ranked = [...sites].sort((a, b) => calculateSiteScore(b.factors).overall - calculateSiteScore(a.factors).overall).slice(0, 5);

  const steps = [
    {
      icon: Search,
      title: th ? "ค้นหาพื้นที่" : "Find a location",
      description: th ? "พิมพ์ชื่อสถานที่ เขต จังหวัด หรือคลิกจุดบนแผนที่" : "Type a place, district or province, or click a point on the map.",
      result: th ? "ได้พิกัดที่ต้องการประเมิน" : "Select the coordinate to evaluate",
    },
    {
      icon: Route,
      title: th ? "กำหนดขอบเขต" : "Choose the area",
      description: th ? "เลือกรัศมี 1, 3, 5 หรือ 10 กม. และใส่ขนาดพื้นที่ถ้ามี" : "Choose a 1, 3, 5 or 10 km radius and add site area if known.",
      result: th ? "กำหนดเงื่อนไขการวิเคราะห์" : "Set the analysis conditions",
    },
    {
      icon: BarChart3,
      title: th ? "ดูผลและตัดสินใจ" : "Review and decide",
      description: th ? "ระบบสรุปคะแนน ประเภทสถานี เหตุผล ความเสี่ยง และข้อมูลที่ยังขาด" : "Review the score, station type, reasons, risks and missing information.",
      result: th ? "รู้ว่าควรทำอะไรต่อ" : "Know the recommended next action",
    },
  ];

  return <main className="page home-page">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <div className="home-kicker"><Sparkles />{th ? "เริ่มต้นง่ายใน 3 ขั้นตอน" : "A clear 3-step workflow"}</div>
        <h1 id="home-title">{th ? <>มีพื้นที่ในใจ?<br /><span>ค้นหาแล้วประเมินได้ทันที</span></> : <>Have a location in mind?<br /><span>Find it and evaluate it now.</span></>}</h1>
        <p>{th ? "ค้นหาพื้นที่ทั่วประเทศไทย แล้วดูความต้องการ คู่แข่ง การเข้าถึง ความเสี่ยง และรูปแบบสถานีที่เหมาะสมในหน้าจอเดียว" : "Search across Thailand and review demand, competition, access, risks and a suitable station format in one workspace."}</p>
        <div className="home-hero-actions">
          <Link className="btn primary btn-large" href="/map"><MapPinned />{th ? "เริ่มค้นหาพื้นที่" : "Start location search"}<ArrowRight /></Link>
          <a className="btn btn-large" href="#how-it-works">{th ? "ดูขั้นตอนการใช้งาน" : "See how it works"}</a>
        </div>
        <div className="home-trust-row">
          <span><CheckCircle2 />{th ? "ใช้ข้อมูลจากผู้ให้บริการจริง" : "Real provider data"}</span>
          <span><CheckCircle2 />{th ? "ไม่ต้องเชื่อมฐานข้อมูลเพื่อทดลอง" : "No database needed for evaluation"}</span>
        </div>
      </div>

      <aside className="home-outcome-card" aria-label={th ? "ผลลัพธ์ที่จะได้รับ" : "What the analysis provides"}>
        <header><div><span>{th ? "หลังวิเคราะห์ คุณจะเห็น" : "After analysis, you will see"}</span><strong>{th ? "คำตอบที่พร้อมใช้ตัดสินใจ" : "A decision-ready summary"}</strong></div><CircleGauge /></header>
        <div className="outcome-list">
          <div><span className="outcome-icon"><CircleGauge /></span><span><small>{th ? "คะแนนพื้นที่" : "Site score"}</small><strong>{th ? "ศักยภาพของทำเล" : "Location potential"}</strong></span><span className="outcome-status">0–100</span></div>
          <div><span className="outcome-icon"><MapPin /></span><span><small>{th ? "รูปแบบที่แนะนำ" : "Recommended format"}</small><strong>{th ? "จุดชาร์จ / ฮับ / สถานีเต็มรูปแบบ" : "Point / Hub / Full station"}</strong></span><ArrowRight /> </div>
          <div><span className="outcome-icon warning"><ShieldCheck /></span><span><small>{th ? "ความเสี่ยงและข้อมูลที่ขาด" : "Risks and data gaps"}</small><strong>{th ? "สิ่งที่ต้องสำรวจต่อก่อนตัดสินใจ" : "What to verify before deciding"}</strong></span><ArrowRight /></div>
        </div>
        <footer><Database />{th ? "ผลลัพธ์เป็นค่าประเมินและต้องสำรวจพื้นที่จริง" : "Results are estimates and still require a site survey"}</footer>
      </aside>
    </section>

    <section className="next-action-card">
      <div className="next-action-number">1</div>
      <div><span>{th ? "สิ่งที่ควรทำตอนนี้" : "Your next action"}</span><strong>{th ? "ค้นหาพื้นที่ที่สนใจบนแผนที่" : "Find the location you want to evaluate"}</strong><p>{th ? "ไม่ต้องตั้งค่า API เพิ่มเพื่อเริ่มค้นหาและเลือกพื้นที่" : "You can search and select a location without configuring another API."}</p></div>
      <Link href="/map" className="btn primary">{th ? "ไปที่แผนที่" : "Open map"}<ArrowRight /></Link>
    </section>

    <section id="how-it-works" className="onboarding-section" aria-labelledby="how-title">
      <div className="section-heading"><div><span>{th ? "วิธีใช้งาน" : "How it works"}</span><h2 id="how-title">{th ? "จากพื้นที่ที่สนใจ สู่คำแนะนำที่เข้าใจง่าย" : "From a location to a clear recommendation"}</h2></div><small>{th ? "ทำตามลำดับจากซ้ายไปขวา" : "Follow the steps from left to right"}</small></div>
      <div className="onboarding-steps">{steps.map((step, index) => { const Icon = step.icon; return <article className="onboarding-step" key={step.title}>
        <div className="step-top"><span className="step-number">{index + 1}</span>{index < steps.length - 1 && <span className="step-connector" />}</div>
        <div className="step-icon"><Icon /></div><h3>{step.title}</h3><p>{step.description}</p><footer><CheckCircle2 />{step.result}</footer>
      </article>; })}</div>
    </section>

    {error && <div className="callout warning"><strong>{th ? "การเชื่อมต่อข้อมูลบริษัทมีปัญหา:" : "Company API error:"}</strong> {error}</div>}

    {sites.length > 0 ? <section className="portfolio-section">
      <div className="section-heading"><div><span>{th ? "พอร์ตบริษัท" : "Company portfolio"}</span><h2>{th ? "ภาพรวมพื้นที่ที่เชื่อมต่อแล้ว" : "Connected location overview"}</h2></div><button className="btn" onClick={() => void refresh()} disabled={loading}><RefreshCw />{th ? "อัปเดต" : "Refresh"}</button></div>
      <div className="kpi-grid" aria-label={th ? "ตัวชี้วัดพอร์ตบริษัท" : "Company portfolio metrics"}>{metrics.map(([label, value, Icon]) => <article className="card kpi-card" key={label}><div className="kpi-top"><div className="kpi-icon"><Icon /></div></div><div className="kpi-value">{loading ? "…" : value}</div><div className="kpi-label">{label}</div></article>)}</div>
      <section className="card ranked-card"><div className="card-head"><div><h2>{th ? "พื้นที่ที่ควรพิจารณาก่อน" : "Priority opportunities"}</h2><p>{th ? "จัดอันดับจากข้อมูลที่ Business API ส่งกลับมา" : "Ranked from connected Business API records"}</p></div></div><div className="card-body rank-list">{ranked.map((site, index) => <Link href={`/sites/${site.id}`} className="rank-item" key={site.id}><span className="rank-no">{String(index + 1).padStart(2, "0")}</span><span><strong>{site.name}</strong><span>{site.province} · {site.businessModel.replaceAll("_", " ")}</span></span><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></Link>)}</div></section>
    </section> : <section className="connection-note">
      <Settings2 /><div><strong>{th ? "ยังไม่ได้เชื่อมต่อพอร์ตข้อมูลบริษัท" : "Company portfolio is not connected"}</strong><p>{th ? "ไม่กระทบการค้นหาและวิเคราะห์พื้นที่สาธารณะ เชื่อมต่อภายหลังได้ในหน้าการตั้งค่า" : "This does not block public location analysis. Connect it later from Settings."}</p></div><Link className="text-link" href="/settings#api-connections">{th ? "ตั้งค่าภายหลัง" : "Configure later"}<ArrowRight /></Link>
    </section>}
  </main>;
}

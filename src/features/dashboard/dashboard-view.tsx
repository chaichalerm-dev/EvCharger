"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Compass, Database, MapPinned, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";
import { translate } from "@/src/lib/i18n";

export function DashboardView() {
  const { language } = useApp();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { data: sites, loading, error, refresh } = useBusinessResource<Site>("sites");
  const scores = sites.map(site => calculateSiteScore(site.factors).overall);
  const metrics = [
    ["Total opportunities", sites.length, Compass],
    ["High potential", scores.filter(score => score >= 75).length, TrendingUp],
    ["Under analysis", sites.filter(site => site.opportunityStatus === "UNDER_ANALYSIS").length, Clock3],
    ["Approved", sites.filter(site => site.opportunityStatus === "APPROVED").length, ShieldCheck],
  ] as const;
  const ranked = [...sites].sort((a, b) => calculateSiteScore(b.factors).overall - calculateSiteScore(a.factors).overall).slice(0, 6);

  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">EV expansion intelligence</div><h1>{t("dashboard")}</h1><p className="page-subtitle">{language === "th" ? "วิเคราะห์ข้อมูลสาธารณะจริงและเชื่อมต่อพอร์ตบริษัทผ่าน API ได้" : "Real public provider analysis with optional company portfolio API"}</p></div><div className="head-actions"><button className="btn" onClick={() => void refresh()} disabled={loading}><RefreshCw />Refresh</button><Link className="btn primary" href="/map">Explore map <ArrowRight /></Link></div></div>
    <div className="demo-banner"><Database /><strong>REAL PROVIDER MODE</strong> · Company metrics appear only after a Business API is configured.</div>
    {error && <div className="callout warning"><strong>Business API error:</strong> {error}</div>}
    <section className="kpi-grid" aria-label="Company portfolio metrics">{metrics.map(([label, value, Icon]) => <article className="card kpi-card" key={label}><div className="kpi-top"><div className="kpi-icon"><Icon /></div></div><div className="kpi-value">{loading ? "…" : value}</div><div className="kpi-label">{label}</div></article>)}</section>
    {!loading && sites.length === 0 ? <section className="card status-card"><MapPinned /><strong>No company portfolio data</strong><p>Use the map now with OpenStreetMap and public providers, or configure your company REST API in Settings.</p><div className="head-actions"><Link className="btn primary" href="/map">Search and analyze an area</Link><Link className="btn" href="/settings#api-connections">Configure APIs</Link></div></section> : <section className="card"><div className="card-head"><div><h2>Ranked opportunities</h2><p>Calculated from records returned by your Business API</p></div></div><div className="card-body rank-list">{ranked.map((site, index) => <Link href={`/sites/${site.id}`} className="rank-item" key={site.id}><span className="rank-no">{String(index + 1).padStart(2, "0")}</span><span><strong>{site.name}</strong><span>{site.province} · {site.businessModel.replaceAll("_", " ")}</span></span><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></Link>)}</div></section>}
  </main>;
}

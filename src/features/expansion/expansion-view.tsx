"use client";

import Link from "next/link";
import { Database, TrendingUp, TriangleAlert } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";

export function ExpansionView() {
  const { data: sites, loading, error } = useBusinessResource<Site>("sites");
  const scores = sites.map(site => calculateSiteScore(site.factors).overall);
  const stages = [
    ["Total", sites.length], ["High potential", scores.filter(score => score >= 75).length], ["Potential", scores.filter(score => score >= 60 && score < 75).length],
    ["Under review", sites.filter(site => ["UNDER_ANALYSIS", "QUALIFIED", "SITE_SURVEY"].includes(site.opportunityStatus)).length], ["Approved", sites.filter(site => site.opportunityStatus === "APPROVED").length],
    ["Construction", sites.filter(site => site.opportunityStatus === "CONSTRUCTION").length], ["Operational", sites.filter(site => site.opportunityStatus === "OPERATIONAL").length],
  ] as const;
  const ranked = [...sites].sort((a, b) => calculateSiteScore(b.factors).overall - calculateSiteScore(a.factors).overall);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Growth portfolio</div><h1>Expansion Dashboard</h1><p className="page-subtitle">Portfolio readiness calculated only from your connected company records</p></div></div>
    <div className="demo-banner"><Database /><strong>BUSINESS API DATA</strong> · No illustrative portfolio totals are inserted.</div>
    {error ? <div className="card status-card"><TriangleAlert /><strong>Business API unavailable</strong><p>{error}</p></div> : loading ? <div className="card status-card"><TrendingUp /><strong>Loading portfolio…</strong></div> : !sites.length ? <div className="card status-card"><TrendingUp /><strong>No expansion portfolio connected</strong><p>Configure the Business API, or use Map Explorer to evaluate a public location.</p><Link className="btn" href="/settings#api-connections">Configure API</Link></div> : <><div className="funnel-grid">{stages.map(([name, value]) => <article className="card funnel-card" key={name}><strong>{value}</strong><span>{name}</span></article>)}</div><section className="card"><div className="card-head"><div><h2>Investment priority</h2><p>Ranked from current Business API records</p></div></div><div className="card-body rank-list">{ranked.map((site, index) => <Link href={`/sites/${site.id}`} className="rank-item" key={site.id}><span className="rank-no">{index + 1}</span><span><strong>{site.name}</strong><span>{site.businessModel.replaceAll("_", " ")} · {site.province}</span></span><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></Link>)}</div></section></>}
  </main>;
}

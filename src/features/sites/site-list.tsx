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
  const { compareIds, toggleCompare } = useApp();
  const { data: sites, loading, error } = useBusinessResource<Site>("sites");
  const rows = useMemo(() => sites.filter(site => `${site.name}${site.province}${site.district}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => calculateSiteScore(b.factors).overall - calculateSiteScore(a.factors).overall), [query, sites]);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Opportunity pipeline</div><h1>Site Opportunities</h1><p className="page-subtitle">Company records loaded from the configured Business REST API</p></div><div className="head-actions"><Link className="btn" href="/compare"><GitCompareArrows />Compare ({compareIds.length})</Link><Link className="btn primary" href="/map"><MapPin />Discover on map</Link></div></div>
    <div className="demo-banner"><Database /><strong>BUSINESS API DATA</strong> · No fixture records are shown.</div>
    <div className="data-toolbar"><div className="field-search"><Search /><input aria-label="Search site opportunities" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search sites, districts or provinces" /></div></div>
    <section className="card">{error ? <div className="status-card"><TriangleAlert /><strong>Business API unavailable</strong><p>{error}</p><Link className="btn" href="/settings#api-connections">Check API connection</Link></div> : loading ? <div className="status-card"><Search /><strong>Loading company records…</strong></div> : !rows.length ? <div className="status-card"><Search /><strong>No company opportunities available</strong><p>Configure the Business API, or use Map Explorer to analyze a public location immediately.</p><Link className="btn primary" href="/map">Open Map Explorer</Link></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Compare</th><th>Opportunity</th><th>Province / District</th><th>Status</th><th>Area</th><th>Flood</th><th>Score</th></tr></thead><tbody>{rows.map(site => <tr key={site.id}><td><input aria-label={`Compare ${site.name}`} type="checkbox" checked={compareIds.includes(site.id)} onChange={() => toggleCompare(site.id)} /></td><td><Link href={`/sites/${site.id}`}><strong className="table-title">{site.name}</strong><span className="table-sub">{site.siteType} · {site.businessModel.replaceAll("_", " ")}</span></Link></td><td>{site.province}<span className="table-sub">{site.district}</span></td><td><span className={`badge ${site.opportunityStatus.toLowerCase()}`}>{site.opportunityStatus.replaceAll("_", " ")}</span></td><td>{site.areaSqm?.toLocaleString() ?? "Unknown"} m²</td><td>{site.floodRisk}</td><td><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></td></tr>)}</tbody></table></div>}</section>
  </main>;
}

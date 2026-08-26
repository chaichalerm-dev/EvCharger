"use client";

import Link from "next/link";
import { ClipboardList, Database, TriangleAlert } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { OPPORTUNITY_LIFECYCLE } from "@/src/config/business";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";

export function OpportunitiesView() {
  const { data: sites, loading, error } = useBusinessResource<Site>("opportunities");
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Decision pipeline</div><h1>Opportunity Lifecycle</h1><p className="page-subtitle">Track company opportunities returned by the configured REST API</p></div></div>
    <div className="demo-banner"><Database /><strong>READ-ONLY API VIEW</strong> · Decisions must be authorized and audited by the production backend.</div>
    <section className="card" style={{ marginBottom: 13 }}><div className="lifecycle">{OPPORTUNITY_LIFECYCLE.map(status => <div className="life-step" key={status}><div className="life-dot" /><span>{status.replaceAll("_", " ")}</span></div>)}</div></section>
    <section className="card">{error ? <div className="status-card"><TriangleAlert /><strong>Business API unavailable</strong><p>{error}</p></div> : loading ? <div className="status-card"><ClipboardList /><strong>Loading opportunities…</strong></div> : !sites.length ? <div className="status-card"><ClipboardList /><strong>No opportunities returned</strong><p>Set the Business API base URL and token in Settings. The expected endpoint is GET /opportunities.</p><Link href="/settings#api-connections" className="btn">Configure API</Link></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Opportunity</th><th>Business model</th><th>Score</th><th>Current stage</th><th>Data status</th></tr></thead><tbody>{sites.map(site => <tr key={site.id}><td><Link href={`/sites/${site.id}`}><strong>{site.name}</strong><span className="table-sub">{site.province}</span></Link></td><td>{site.businessModel.replaceAll("_", " ")}</td><td><span className="site-score-cell">{calculateSiteScore(site.factors).overall}</span></td><td><span className={`badge ${site.opportunityStatus.toLowerCase()}`}>{site.opportunityStatus.replaceAll("_", " ")}</span></td><td>{site.provenance.verifiedStatus}</td></tr>)}</tbody></table></div>}</section>
  </main>;
}

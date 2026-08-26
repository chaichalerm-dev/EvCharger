"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Database, Search, TriangleAlert } from "lucide-react";
import type { Branch, Partner } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";

export function BranchesView() {
  const [query, setQuery] = useState("");
  const branches = useBusinessResource<Branch>("branches");
  const partners = useBusinessResource<Partner>("partners");
  const rows = useMemo(() => branches.data.filter(branch => `${branch.name}${branch.province}${branch.district}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.siteScore - a.siteScore), [branches.data, query]);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Portfolio intelligence</div><h1>Branch Ranking</h1><p className="page-subtitle">Company branches loaded from your configured Business API</p></div></div>
    <div className="demo-banner"><Database /><strong>BUSINESS API DATA</strong> · Unknown survey fields remain Unknown.</div>
    <div className="data-toolbar"><div className="field-search"><Search /><input aria-label="Search partner branches" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search branch, district or province" /></div></div>
    <section className="card">{branches.error ? <div className="status-card"><TriangleAlert /><strong>Business API unavailable</strong><p>{branches.error}</p></div> : branches.loading ? <div className="status-card"><Building2 /><strong>Loading branches…</strong></div> : !rows.length ? <div className="status-card"><Building2 /><strong>No branches returned</strong><p>Configure GET /branches in the Business API.</p><Link className="btn" href="/settings#api-connections">Configure API</Link></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Rank</th><th>Branch</th><th>Partner</th><th>Area / Parking</th><th>Electrical</th><th>Score</th><th>Recommendation</th><th>Installation</th></tr></thead><tbody>{rows.map((branch, index) => <tr key={branch.id}><td>{String(index + 1).padStart(2, "0")}</td><td><strong>{branch.name}</strong><span className="table-sub">{branch.district}, {branch.province}</span></td><td>{partners.data.find(partner => partner.id === branch.partnerId)?.name ?? "Unknown"}</td><td>{branch.availableAreaSqm ?? "Unknown"} m²<span className="table-sub">{branch.parkingSpaces ?? "Unknown"} spaces</span></td><td>{branch.electricalStatus || "Requires Site Survey"}</td><td><span className="site-score-cell">{branch.siteScore}</span></td><td>{branch.recommendedStation.replaceAll("_", " ")}</td><td>{branch.installationStatus.replaceAll("_", " ")}</td></tr>)}</tbody></table></div>}</section>
  </main>;
}

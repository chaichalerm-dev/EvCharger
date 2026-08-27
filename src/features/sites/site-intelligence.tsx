"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, HelpCircle, MapPin, Navigation } from "lucide-react";
import type { Site } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { recommendSite } from "@/src/services/recommendation-engine";
import { ScoreBar } from "@/src/components/ui/score-bar";

export function SiteIntelligence() {
  const { id } = useParams<{ id: string }>();
  const { data: sites, loading, error } = useBusinessResource<Site>("sites");
  const site = sites.find(row => row.id === id);
  if (loading) return <main className="page"><div className="card status-card"><MapPin /><strong>Loading site intelligence…</strong></div></main>;
  if (error || !site) return <main className="page"><Link href="/sites" className="btn"><ArrowLeft />All opportunities</Link><div className="card status-card" style={{ marginTop: 13 }}><AlertTriangle /><strong>{error ? "Business API unavailable" : "Site not found"}</strong><p>{error ?? "The configured API did not return this identifier."}</p></div></main>;
  const score = calculateSiteScore(site.factors);
  const recommendation = recommendSite(site, score);
  return <main className="page">
    <Link href="/sites" className="btn"><ArrowLeft />All opportunities</Link>
    <section className="detail-head" style={{ marginTop: 13 }}><div className="detail-head-top"><div><span className={`quality-badge ${site.provenance.verifiedStatus.toLowerCase()}`}>{site.provenance.verifiedStatus} DATA</span><h1>{site.name}</h1><p className="page-subtitle">{site.address || "Unknown"}</p><div className="detail-meta"><span><MapPin />{site.district}, {site.province}</span><span><Navigation />{site.latitude.toFixed(5)}, {site.longitude.toFixed(5)}</span></div></div><div className="detail-score"><strong>{score.overall}</strong><span>OVERALL SITE SCORE · {score.configurationVersion}</span></div></div></section>
    <div className="detail-grid"><div style={{ display: "grid", gap: 13 }}><section className="card section-card"><h2>Location overview</h2><div className="info-grid">{[["Site type", site.siteType], ["Business model", site.businessModel.replaceAll("_", " ")], ["Available area", site.areaSqm ? `${site.areaSqm.toLocaleString()} m²` : "Unknown"], ["Area quality", site.areaVerified ? "Verified" : "Estimated"], ["Traffic", site.trafficLevel], ["Population density", site.populationDensity?.toLocaleString() ?? "Unknown"], ["Electrical status", site.powerAvailability ?? "Requires Site Survey"], ["Flood risk", site.floodRisk]].map(([label, value]) => <div className="info-item" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section><section className="card section-card"><h2>Weighted factors</h2><div className="score-factor-grid">{Object.entries(score.factors).map(([factor, value]) => <ScoreBar key={factor} label={factor.replaceAll(/([A-Z])/g, " $1")} value={value} />)}</div></section></div><aside><section className="card recommend-card"><span>Business recommendation</span><strong>{recommendation.label.replaceAll("_", " ")}</strong><small>{recommendation.stationType.replaceAll("_", " ")}</small><h3>Reasons</h3><ul className="explain-list good">{recommendation.reasons.map(reason => <li key={reason}><CheckCircle2 />{reason}</li>)}</ul>{recommendation.risks.length > 0 && <><h3>Risks</h3><ul className="explain-list risk">{recommendation.risks.map(risk => <li key={risk}><AlertTriangle />{risk}</li>)}</ul></>}<h3>Missing information</h3><ul className="explain-list missing">{recommendation.missingInformation.map(item => <li key={item}><HelpCircle />{item}</li>)}</ul></section></aside></div>
  </main>;
}

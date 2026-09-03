"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import type { Branch, Partner } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";

export function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const partners = useBusinessResource<Partner>("partners");
  const branchesResource = useBusinessResource<Branch>("branches");
  const partner = partners.data.find(row => row.id === id);
  // สาขาไม่มี endpoint แยกตามพันธมิตรโดยเฉพาะ จึงดึงมาทั้งหมดแล้วกรองด้วย partnerId ฝั่ง client
  // (เพียงพอสำหรับต้นแบบ ส่วน API จริงควร filter/pagination ฝั่ง server)
  const branches = branchesResource.data.filter(branch => branch.partnerId === id).sort((a, b) => b.siteScore - a.siteScore);
  if (partners.loading || branchesResource.loading) return <main className="page"><div className="card status-card"><Building2 /><strong>Loading partner…</strong></div></main>;
  if (!partner) return <main className="page"><Link className="btn" href="/partners"><ArrowLeft />All partners</Link><div className="card status-card" style={{ marginTop: 13 }}><Building2 /><strong>Partner not found</strong><p>Check the Business API connection and partner identifier.</p></div></main>;
  return <main className="page"><Link className="btn" href="/partners"><ArrowLeft />All partners</Link><section className="detail-head" style={{ marginTop: 13 }}><div className="detail-head-top"><div><span className="badge green">{partner.status}</span><h1>{partner.name}</h1><p className="page-subtitle">{partner.type.replaceAll("_", " ")} · {partner.businessType}</p><div className="detail-meta"><span><Building2 />{partner.branchCount} branches</span><span>Contract: {partner.contractStatus}</span></div></div><div className="detail-score"><strong>{branches.length}</strong><span>API BRANCHES</span></div></div></section><section className="card"><div className="card-head"><div><h2>Branch ranking</h2><p>Each branch is evaluated independently</p></div></div>{branches.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Rank</th><th>Branch</th><th>Area</th><th>Electrical</th><th>Score</th><th>Recommendation</th></tr></thead><tbody>{branches.map((branch, index) => <tr key={branch.id}><td>{index + 1}</td><td><strong>{branch.name}</strong><span className="table-sub">{branch.district}, {branch.province}</span></td><td>{branch.availableAreaSqm ?? "Unknown"} m²</td><td>{branch.electricalStatus || "Requires Site Survey"}</td><td><span className="site-score-cell">{branch.siteScore}</span></td><td>{branch.recommendedStation.replaceAll("_", " ")}</td></tr>)}</tbody></table></div> : <div className="status-card"><Building2 /><strong>No branches returned for this partner</strong></div>}</section></main>;
}

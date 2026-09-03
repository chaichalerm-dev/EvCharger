"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Database, Search, TriangleAlert } from "lucide-react";
import type { Branch, Partner } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { useApp } from "@/src/store/app-context";

export function BranchesView() {
  const [query, setQuery] = useState("");
  const { language } = useApp();
  const th = language === "th";
  const branches = useBusinessResource<Branch>("branches");
  // ดึงข้อมูลพันธมิตรแยกต่างหาก แล้วจับคู่ด้วย id ฝั่ง client ด้านล่าง (payload ของสาขามีแค่ partnerId)
  const partners = useBusinessResource<Partner>("partners");
  const rows = useMemo(() => branches.data.filter(branch => `${branch.name}${branch.province}${branch.district}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.siteScore - a.siteScore), [branches.data, query]);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "ข้อมูลเชิงลึกของพอร์ต" : "Portfolio intelligence"}</div><h1>{th ? "อันดับสาขา" : "Branch Ranking"}</h1><p className="page-subtitle">{th ? "ข้อมูลสาขาบริษัทจาก Business API ที่ตั้งค่าไว้" : "Company branches loaded from your configured Business API"}</p></div></div>
    <div className="demo-banner"><Database /><strong>{th ? "ข้อมูลจาก BUSINESS API" : "BUSINESS API DATA"}</strong> · {th ? "ข้อมูลสำรวจที่ไม่มีจะยังคงแสดงว่าไม่ทราบ" : "Unknown survey fields remain Unknown."}</div>
    <div className="data-toolbar"><div className="field-search"><Search /><input aria-label={th ? "ค้นหาสาขาพันธมิตร" : "Search partner branches"} value={query} onChange={event => setQuery(event.target.value)} placeholder={th ? "ค้นหาสาขา เขต หรือจังหวัด" : "Search branch, district or province"} /></div></div>
    <section className="card">{branches.error ? <div className="status-card"><TriangleAlert /><strong>{th ? "ไม่สามารถเชื่อมต่อ Business API" : "Business API unavailable"}</strong><p>{branches.error}</p></div> : branches.loading ? <div className="status-card"><Building2 /><strong>{th ? "กำลังโหลดสาขา…" : "Loading branches…"}</strong></div> : !rows.length ? <div className="status-card"><Building2 /><strong>{th ? "API ยังไม่ส่งข้อมูลสาขากลับมา" : "No branches returned"}</strong><p>{th ? "ตั้งค่า GET /branches ใน Business API" : "Configure GET /branches in the Business API."}</p><Link className="btn" href="/settings#api-connections">{th ? "ตั้งค่า API" : "Configure API"}</Link></div> : <div className="table-wrap"><table className="data-table"><thead><tr><th>{th ? "อันดับ" : "Rank"}</th><th>{th ? "สาขา" : "Branch"}</th><th>{th ? "พันธมิตร" : "Partner"}</th><th>{th ? "พื้นที่ / ที่จอดรถ" : "Area / Parking"}</th><th>{th ? "ระบบไฟฟ้า" : "Electrical"}</th><th>{th ? "คะแนน" : "Score"}</th><th>{th ? "คำแนะนำ" : "Recommendation"}</th><th>{th ? "การติดตั้ง" : "Installation"}</th></tr></thead><tbody>{rows.map((branch, index) => <tr key={branch.id}><td>{String(index + 1).padStart(2, "0")}</td><td><strong>{branch.name}</strong><span className="table-sub">{branch.district}, {branch.province}</span></td><td>{partners.data.find(partner => partner.id === branch.partnerId)?.name ?? (th ? "ไม่ทราบ" : "Unknown")}</td><td>{branch.availableAreaSqm ?? (th ? "ไม่ทราบ" : "Unknown")} m²<span className="table-sub">{branch.parkingSpaces ?? (th ? "ไม่ทราบ" : "Unknown")} {th ? "ช่อง" : "spaces"}</span></td><td>{branch.electricalStatus || (th ? "ต้องสำรวจพื้นที่" : "Requires Site Survey")}</td><td><span className="site-score-cell">{branch.siteScore}</span></td><td>{branch.recommendedStation.replaceAll("_", " ")}</td><td>{branch.installationStatus.replaceAll("_", " ")}</td></tr>)}</tbody></table></div>}</section>
  </main>;
}

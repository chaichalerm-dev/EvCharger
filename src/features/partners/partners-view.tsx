"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, HardDrive, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { Partner } from "@/src/domain/models";
import { useBusinessResource } from "@/src/hooks/use-business-resource";
import { submissionSchema, submissionService } from "@/src/services/submission.service";
import { useApp } from "@/src/store/app-context";

type FormInput = z.input<typeof submissionSchema>;
type FormData = z.output<typeof submissionSchema>;

export function PartnersView() {
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [localCount, setLocalCount] = useState(0);
  const { data: partners, loading, error } = useBusinessResource<Partner>("partners");
  const { hasPermission, language } = useApp();
  const th = language === "th";
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormData>({ resolver: zodResolver(submissionSchema), defaultValues: { facilities: "", notes: "" } });
  useEffect(() => { void submissionService.list().then(rows => setLocalCount(rows.length)); }, []);
  const submit = async (data: FormData) => { await submissionService.create(data); setLocalCount(value => value + 1); reset(); setShowForm(false); setToast(th ? "บันทึกในพื้นที่จัดเก็บต้นแบบแล้ว เชื่อมต่อ POST /sites เพื่อซิงโครไนซ์ในระบบจริง" : "Saved in prototype local storage. Connect POST /sites to synchronize in production."); window.setTimeout(() => setToast(""), 3500); };

  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "เครือข่ายพันธมิตร" : "Partner network"}</div><h1>{th ? "พันธมิตร" : "Partners"}</h1><p className="page-subtitle">{th ? "ข้อมูลพันธมิตรจาก Business API และการส่งพื้นที่แบบต้นแบบที่ระบุไว้อย่างชัดเจน" : "Partner records from your Business API; local site submission remains a clearly marked prototype feature"}</p></div>{hasPermission("SUBMIT_SITE") && <button className="btn primary" onClick={() => setShowForm(value => !value)}><Plus />{th ? "ส่งพื้นที่พันธมิตร" : "Submit partner site"}</button>}</div>
    <div className="demo-banner"><Database /><strong>{th ? "ข้อมูลจาก BUSINESS API" : "BUSINESS API DATA"}</strong> · {localCount} {th ? "รายการที่บันทึกในเครื่องแบบต้นแบบ" : "local prototype submission(s)."}</div>
    {showForm && <form className="card form-card" onSubmit={handleSubmit(submit)} noValidate><h2>{th ? "ส่งพื้นที่ของพันธมิตร" : "Partner site submission"}</h2><div className="callout warning"><strong>{th ? "พื้นที่จัดเก็บต้นแบบ:" : "Prototype local storage:"}</strong> {th ? "ห้ามกรอกข้อมูลส่วนบุคคลที่ละเอียดอ่อน เพราะไม่ใช่พื้นที่จัดเก็บที่ปลอดภัย" : "Do not enter sensitive personal information. This is not secure storage."}</div><div className="form-grid">
      <Field label={th ? "ชื่อสถานที่" : "Location name"} error={errors.location?.message}><input className="form-input" {...register("location")} /></Field>
      <Field label={th ? "ประเภทธุรกิจ" : "Business type"} error={errors.businessType?.message}><select className="form-input" {...register("businessType")}><option value="">{th ? "เลือกประเภท" : "Select type"}</option>{["Gas station", "Mall", "Hotel", "Restaurant", "Office", "Factory", "Parking", "Commercial property"].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label={th ? "ที่อยู่" : "Address"} error={errors.address?.message} full><input className="form-input" {...register("address")} /></Field>
      <Field label={th ? "ขนาดพื้นที่ (ม²)" : "Site area (m²)"} error={errors.siteArea?.message}><input type="number" className="form-input" {...register("siteArea")} /></Field>
      <Field label={th ? "จำนวนที่จอดรถ" : "Parking spaces"} error={errors.parking?.message}><input type="number" className="form-input" {...register("parking")} /></Field>
      <Field label={th ? "สิ่งอำนวยความสะดวกที่มี" : "Existing facilities"} error={errors.facilities?.message}><textarea className="form-textarea" {...register("facilities")} /></Field>
      <Field label={th ? "หมายเหตุ" : "Notes"} error={errors.notes?.message}><textarea className="form-textarea" {...register("notes")} /></Field>
      <Field label={th ? "ชื่อผู้ติดต่อทางธุรกิจ (หลีกเลี่ยงข้อมูลส่วนบุคคล)" : "Business contact label (avoid personal data)"} error={errors.contact?.message}><input className="form-input" {...register("contact")} /></Field>
    </div><div className="form-actions"><span className="prototype-note"><HardDrive />{th ? "จัดเก็บในเครื่องแบบต้นแบบ" : "Prototype local persistence"}</span><button type="button" className="btn" onClick={() => setShowForm(false)}>{th ? "ยกเลิก" : "Cancel"}</button><button className="btn primary" disabled={isSubmitting}>{th ? "ตรวจสอบและส่ง" : "Validate & submit"}</button></div></form>}
    {error ? <div className="card status-card"><strong>{th ? "Business API เกิดข้อผิดพลาด" : "Business API error"}</strong><p>{error}</p></div> : loading ? <div className="card status-card"><strong>{th ? "กำลังโหลดพันธมิตร…" : "Loading partners…"}</strong></div> : partners.length === 0 ? <div className="card status-card"><strong>{th ? "API ยังไม่ส่งข้อมูลพันธมิตรกลับมา" : "No partners returned"}</strong><p>{th ? "ตั้งค่า GET /partners ในหน้าการตั้งค่า" : "Configure GET /partners in Settings."}</p><Link className="btn" href="/settings#api-connections">{th ? "ตั้งค่า API" : "Configure API"}</Link></div> : <section className="partner-grid">{partners.map(partner => <Link className="card partner-card" href={`/partners/${partner.id}`} key={partner.id}><header><span className="partner-logo">{partner.name.split(" ").map(value => value[0]).slice(0, 2).join("")}</span><span className={`badge ${partner.status === "ACTIVE" ? "green" : "amber"}`}>{partner.status}</span></header><h2>{partner.name}</h2><p>{partner.businessType} · {partner.type.replaceAll("_", " ")}</p><div className="partner-stats"><div><span>{th ? "สาขา" : "Branches"}</span><strong>{partner.branchCount}</strong></div><div><span>{th ? "สัญญา" : "Contract"}</span><strong>{partner.contractStatus}</strong></div></div></Link>)}</section>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) { return <div className={`form-field ${full ? "full" : ""}`}><label>{label}</label>{children}{error && <div className="form-error">{error}</div>}</div>; }

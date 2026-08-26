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
  const { hasPermission } = useApp();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormData>({ resolver: zodResolver(submissionSchema), defaultValues: { facilities: "", notes: "" } });
  useEffect(() => { void submissionService.list().then(rows => setLocalCount(rows.length)); }, []);
  const submit = async (data: FormData) => { await submissionService.create(data); setLocalCount(value => value + 1); reset(); setShowForm(false); setToast("Saved in prototype local storage. Connect POST /sites to synchronize in production."); window.setTimeout(() => setToast(""), 3500); };

  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Partner network</div><h1>Partners</h1><p className="page-subtitle">Partner records from your Business API; local site submission remains a clearly marked prototype feature</p></div>{hasPermission("SUBMIT_SITE") && <button className="btn primary" onClick={() => setShowForm(value => !value)}><Plus />Submit partner site</button>}</div>
    <div className="demo-banner"><Database /><strong>BUSINESS API DATA</strong> · {localCount} local prototype submission(s).</div>
    {showForm && <form className="card form-card" onSubmit={handleSubmit(submit)} noValidate><h2>Partner site submission</h2><div className="callout warning"><strong>Prototype local storage:</strong> Do not enter sensitive personal information. This is not secure storage.</div><div className="form-grid">
      <Field label="Location name" error={errors.location?.message}><input className="form-input" {...register("location")} /></Field>
      <Field label="Business type" error={errors.businessType?.message}><select className="form-input" {...register("businessType")}><option value="">Select type</option>{["Gas station", "Mall", "Hotel", "Restaurant", "Office", "Factory", "Parking", "Commercial property"].map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Address" error={errors.address?.message} full><input className="form-input" {...register("address")} /></Field>
      <Field label="Site area (m²)" error={errors.siteArea?.message}><input type="number" className="form-input" {...register("siteArea")} /></Field>
      <Field label="Parking spaces" error={errors.parking?.message}><input type="number" className="form-input" {...register("parking")} /></Field>
      <Field label="Existing facilities" error={errors.facilities?.message}><textarea className="form-textarea" {...register("facilities")} /></Field>
      <Field label="Notes" error={errors.notes?.message}><textarea className="form-textarea" {...register("notes")} /></Field>
      <Field label="Business contact label (avoid personal data)" error={errors.contact?.message}><input className="form-input" {...register("contact")} /></Field>
    </div><div className="form-actions"><span className="prototype-note"><HardDrive />Prototype local persistence</span><button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button><button className="btn primary" disabled={isSubmitting}>Validate & submit</button></div></form>}
    {error ? <div className="card status-card"><strong>Business API error</strong><p>{error}</p></div> : loading ? <div className="card status-card"><strong>Loading partners…</strong></div> : partners.length === 0 ? <div className="card status-card"><strong>No partners returned</strong><p>Configure GET /partners in Settings.</p><Link className="btn" href="/settings#api-connections">Configure API</Link></div> : <section className="partner-grid">{partners.map(partner => <Link className="card partner-card" href={`/partners/${partner.id}`} key={partner.id}><header><span className="partner-logo">{partner.name.split(" ").map(value => value[0]).slice(0, 2).join("")}</span><span className={`badge ${partner.status === "ACTIVE" ? "green" : "amber"}`}>{partner.status}</span></header><h2>{partner.name}</h2><p>{partner.businessType} · {partner.type.replaceAll("_", " ")}</p><div className="partner-stats"><div><span>Branches</span><strong>{partner.branchCount}</strong></div><div><span>Contract</span><strong>{partner.contractStatus}</strong></div></div></Link>)}</section>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) { return <div className={`form-field ${full ? "full" : ""}`}><label>{label}</label>{children}{error && <div className="form-error">{error}</div>}</div>; }

"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { Database,HardDrive,Plus,UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { catalogService } from "@/src/services/catalog.service";
import { submissionSchema,submissionService } from "@/src/services/submission.service";
import { useApp } from "@/src/store/app-context";

type FormInput=z.input<typeof submissionSchema>;
type FormData=z.output<typeof submissionSchema>;
const MOCK_PARTNERS=catalogService.getPartners();

export function PartnersView(){
  const[showForm,setShowForm]=useState(false);
  const[toast,setToast]=useState("");
  const[photo,setPhoto]=useState<{url:string;name:string}|null>(null);
  const[localCount,setLocalCount]=useState(0);
  const{hasPermission}=useApp();
  const{register,handleSubmit,reset,formState:{errors,isSubmitting}}=useForm<FormInput,unknown,FormData>({resolver:zodResolver(submissionSchema),defaultValues:{facilities:"",notes:""}});
  useEffect(()=>{submissionService.list().then(x=>setLocalCount(x.length))},[]);
  const onFile=(file?:File)=>{if(photo)URL.revokeObjectURL(photo.url);setPhoto(null);if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>3*1024*1024){setToast("Photo must be JPG, PNG or WebP and no larger than 3 MB.");return}setPhoto({url:URL.createObjectURL(file),name:file.name})};
  const submit=async(data:FormData)=>{await submissionService.create(data);setLocalCount(x=>x+1);reset();setPhoto(null);setShowForm(false);setToast("Site submitted to prototype local storage and queued for demo analysis.");setTimeout(()=>setToast(""),3500)};
  return <main className="page"><div className="page-head"><div><div className="eyebrow">Partner network</div><h1>Partners</h1><p className="page-subtitle">Manage host relationships and evaluate each branch independently</p></div>{hasPermission("SUBMIT_SITE")&&<button className="btn primary" onClick={()=>setShowForm(x=>!x)}><Plus/>Submit partner site</button>}</div><div className="demo-banner"><Database/>Demo partner records · {localCount} submission(s) stored only in this browser.</div>{showForm&&<form className="card form-card" onSubmit={handleSubmit(submit)} noValidate><h2>Partner site submission</h2><p>Submit → Validate → Analyze → Score → Recommendation → Review</p><div className="callout warning"><strong>Prototype local storage:</strong> Do not enter sensitive personal information. This browser-local record is not secure storage and does not sync between devices.</div><div className="form-grid"><Field label="Location name" error={errors.location?.message}><input className="form-input" {...register("location")}/></Field><Field label="Business type" error={errors.businessType?.message}><select className="form-input" {...register("businessType")}><option value="">Select type</option>{["Gas station","Mall","Hotel","Restaurant","Office","Factory","Parking","Commercial property"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Address" error={errors.address?.message} full><input className="form-input" {...register("address")}/></Field><Field label="Site area (m²)" error={errors.siteArea?.message}><input type="number" className="form-input" {...register("siteArea")}/></Field><Field label="Parking spaces" error={errors.parking?.message}><input type="number" className="form-input" {...register("parking")}/></Field><Field label="Existing facilities" error={errors.facilities?.message}><textarea className="form-textarea" {...register("facilities")}/></Field><Field label="Notes" error={errors.notes?.message}><textarea className="form-textarea" {...register("notes")}/></Field><Field label="Business contact label (avoid personal data)" error={errors.contact?.message}><input className="form-input" {...register("contact")}/></Field><Field label="Optional site photo" full><div className="upload-zone"><UploadCloud size={18}/><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>onFile(e.target.files?.[0])}/>{photo&&<div className="upload-preview"><img src={photo.url} alt="Local site preview"/><span>{photo.name} · local preview only; image bytes are not persisted</span></div>}</div></Field></div><div className="form-actions"><span className="prototype-note"><HardDrive/>Prototype local persistence</span><button type="button" className="btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="btn primary" disabled={isSubmitting}>Validate & submit</button></div></form>}<section className="partner-grid">{MOCK_PARTNERS.map(p=><Link className="card partner-card" href={"/partners/"+p.id} key={p.id}><header><span className="partner-logo">{p.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><span className={"badge "+(p.status==="ACTIVE"?"green":"amber")}>{p.status}</span></header><h2>{p.name}</h2><p>{p.businessType} · {p.type.replaceAll("_"," ")}</p><div className="partner-stats"><div><span>Branches</span><strong>{p.branchCount}</strong></div><div><span>Contract</span><strong>{p.contractStatus}</strong></div></div></Link>)}</section>{toast&&<div className="toast" role="status">{toast}</div>}</main>
}
function Field({label,error,full,children}:{label:string;error?:string;full?:boolean;children:React.ReactNode}){return <div className={"form-field "+(full?"full":"")}><label>{label}</label>{children}{error&&<div className="form-error">{error}</div>}</div>}

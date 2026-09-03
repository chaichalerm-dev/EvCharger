"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { CheckCircle2, Cloud, Database, ExternalLink, Globe2, KeyRound, Moon, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { useApp } from "@/src/store/app-context";
import type { DemoRole } from "@/src/config/permissions";
import { EXTERNAL_PROVIDERS } from "@/src/config/external-providers";
import {
  clearAllApiTokens, getApiConnectionsSnapshot, resetApiConnection, subscribeApiConnections, updateApiConnection,
  type ApiProviderId
} from "@/src/services/api-connection.service";

function ApiConnections({ language }: { language: "en" | "th" }) {
  const th = language === "th";
  const connections = useSyncExternalStore(subscribeApiConnections, getApiConnectionsSnapshot, getApiConnectionsSnapshot);
  const [endpoints, setEndpoints] = useState<Record<string, string>>(() => Object.fromEntries(EXTERNAL_PROVIDERS.map((provider) => [provider.runtimeId, connections[provider.runtimeId].endpoint])));
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

  // โทเคนจะถูกส่งเข้า store ในหน่วยความจำของ updateApiConnection เท่านั้น ไม่ถูกบันทึกถาวร —
  // ดู AI.md §5: โทเคนที่ผู้ใช้กรอกต้องอยู่ใน memory เท่านั้น ห้ามเก็บใน localStorage
  const apply = (id: ApiProviderId) => {
    try {
      updateApiConnection(id, { endpoint: endpoints[id], ...(tokens[id] ? { token: tokens[id] } : {}) });
      setTokens((current) => ({ ...current, [id]: "" }));
      setMessage((current) => ({ ...current, [id]: "Applied for this browser session" }));
    } catch (error) {
      setMessage((current) => ({ ...current, [id]: error instanceof Error ? error.message : "Invalid configuration" }));
    }
  };

  const reset = (id: ApiProviderId) => {
    resetApiConnection(id);
    const value = getApiConnectionsSnapshot()[id].endpoint;
    setEndpoints((current) => ({ ...current, [id]: value }));
    setTokens((current) => ({ ...current, [id]: "" }));
    setMessage((current) => ({ ...current, [id]: "Default restored" }));
  };

  return <section id="api-connections" className="card setting-card provider-card api-connections-card">
    <div className="card-head" style={{ padding: 0 }}><div><h2>{th ? "การเชื่อมต่อ API" : "API Connections"}</h2><p>{th ? "เปลี่ยน endpoint หรือ API key ที่หมดอายุ/ใกล้เต็มโควตาได้โดยไม่แก้โค้ด" : "Change endpoints and replace expired or quota-limited API keys without editing code"}</p></div><KeyRound size={17} /></div>
    <div className="callout warning provider-note">{th ? "ความปลอดภัย: API key จะอยู่ในหน่วยความจำของหน้านี้เท่านั้นและถูกล้างเมื่อรีเฟรช ไม่ถูกบันทึกใน localStorage, source code, Git หรือเว็บไซต์ที่เผยแพร่ คีย์ที่ใส่ในเบราว์เซอร์ควรเป็น public/client key ที่ผู้ให้บริการอนุญาตเท่านั้น ส่วน secret ของระบบจริงต้องผ่าน backend proxy" : "Security: API keys are held only in page memory and are cleared on refresh. They are never written to localStorage, source code, Git, or the deployed Site. Browser-visible keys are suitable only for provider-approved public/client keys; production secrets require a backend proxy."}</div>
    <div className="api-provider-list">
      {EXTERNAL_PROVIDERS.map((provider) => {
        const connection = connections[provider.runtimeId];
        const ready = connection.enabled && Boolean(connection.endpoint) && (!provider.keyRequired || Boolean(connection.token));
        return <article className="api-provider-editor" key={provider.runtimeId}>
          <header><div><strong>{provider.name}</strong><span>{provider.capability}</span></div><span className={`badge ${ready ? "green" : "amber"}`}>{ready ? (th ? "พร้อม" : "READY") : (th ? "ต้องใส่โทเคน" : "TOKEN NEEDED")}</span></header>
          <label>Endpoint<input className="form-input" value={endpoints[provider.runtimeId] ?? connection.endpoint} onChange={(event) => setEndpoints((current) => ({ ...current, [provider.runtimeId]: event.target.value }))} spellCheck={false} /></label>
          <label>{provider.tokenLabel ?? "API token (not required)"}<input className="form-input" type="password" value={tokens[provider.runtimeId] ?? ""} onChange={(event) => setTokens((current) => ({ ...current, [provider.runtimeId]: event.target.value }))} placeholder={connection.token ? "Token configured — enter a replacement" : provider.keyRequired ? "Enter API key" : "Optional"} autoComplete="off" /></label>
          <div className="api-provider-actions">
            <label className="provider-toggle"><input type="checkbox" checked={connection.enabled} onChange={(event) => updateApiConnection(provider.runtimeId, { enabled: event.target.checked })} /> {th ? "เปิดใช้งาน" : "Enabled"}</label>
            <button className="btn primary" type="button" onClick={() => apply(provider.runtimeId)}><CheckCircle2 />{th ? "นำไปใช้" : "Apply"}</button>
            {connection.token && <button className="btn" type="button" onClick={() => { updateApiConnection(provider.runtimeId, { token: "" }); setMessage((current) => ({ ...current, [provider.runtimeId]: "Token cleared" })); }}><Trash2 />{th ? "ล้างโทเคน" : "Clear token"}</button>}
            <button className="btn" type="button" onClick={() => reset(provider.runtimeId)}><RotateCcw />{th ? "ค่าเริ่มต้น" : "Default"}</button>
          </div>
          <footer><span>{provider.freeLimit}</span>{message[provider.runtimeId] && <strong>{message[provider.runtimeId]}</strong>}</footer>
        </article>;
      })}
    </div>
    <button className="btn" type="button" onClick={() => { clearAllApiTokens(); setTokens({}); }}><Trash2 />{th ? "ล้างโทเคนทั้งหมดจากหน่วยความจำ" : "Clear every in-memory token"}</button>
  </section>;
}

export function SettingsView() {
  const [interactive, setInteractive] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, role, setRole } = useApp();
  const connections = useSyncExternalStore(subscribeApiConnections, getApiConnectionsSnapshot, getApiConnectionsSnapshot);
  const businessConnected = connections["business-api"].enabled && Boolean(connections["business-api"].endpoint) && Boolean(connections["business-api"].token);
  const th = language === "th";
  useEffect(() => {
    const timer = window.setTimeout(() => setInteractive(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">{th ? "การควบคุมประสบการณ์" : "Experience controls"}</div><h1>{th ? "การตั้งค่า" : "Settings"}</h1><p className="page-subtitle">{th ? "ภาษา ธีม สิทธิ์ต้นแบบ และผู้ให้บริการข้อมูลภายนอก" : "Language, theme, prototype access and external data providers"}</p></div></div>
    <div className="settings-grid">
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>{th ? "รูปลักษณ์" : "Appearance"}</h2><p>{th ? "บันทึกเป็นค่ากำหนดเฉพาะอุปกรณ์" : "Stored as a device-local preference"}</p></div><Moon size={17} /></div>
        <div className="setting-row"><div><strong>{th ? "โหมดสี" : "Color theme"}</strong><span>{th ? "สว่าง มืด หรือตามระบบ" : "Light, dark or follow system"}</span></div><select aria-label={th ? "โหมดสี" : "Color theme"} className="select" disabled={!interactive} value={interactive ? theme : "light"} onChange={(event) => setTheme(event.target.value)}><option value="light">{th ? "สว่าง" : "Light"}</option><option value="dark">{th ? "มืด" : "Dark"}</option><option value="system">{th ? "ตามระบบ" : "System"}</option></select></div>
        <div className="setting-row"><div><strong>{th ? "ภาษา" : "Language"}</strong><span>{th ? "ภาษาที่ใช้ในส่วนติดต่อ" : "Interface language"}</span></div><select aria-label={th ? "ภาษา" : "Language"} className="select" disabled={!interactive} value={language} onChange={(event) => setLanguage(event.target.value as "en" | "th")}><option value="en">English</option><option value="th">ไทย</option></select></div>
      </section>
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>{th ? "สิทธิ์การใช้งานต้นแบบ" : "Prototype authorization"}</h2><p>{th ? "สาธิตสิทธิ์เฉพาะประสบการณ์ผู้ใช้" : "UX-only permission demonstration"}</p></div><ShieldCheck size={17} /></div>
        <div className="setting-row"><div><strong>{th ? "บทบาทสาธิต" : "Demo role"}</strong><span>{th ? "ไม่ใช่การยืนยันตัวตนที่ปลอดภัย" : "Not secure authentication"}</span></div><select className="select" disabled={!interactive} value={role} onChange={(event) => setRole(event.target.value as DemoRole)}>{["ADMIN", "BUSINESS_DEVELOPMENT", "ANALYST", "PARTNER", "VIEWER"].map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="callout warning" style={{ marginTop: 13 }}>{th ? "การตรวจบทบาทฝั่งหน้าบ้านควบคุมเฉพาะ UX ต้นแบบ ระบบหลังบ้านในอนาคตต้องยืนยันตัวตนและบังคับใช้สิทธิ์ทุกการตัดสินใจอย่างเป็นอิสระ" : "Frontend role checks only control prototype UX. A future backend must independently authenticate users and enforce every authorization decision."}</div>
      </section>
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>{th ? "ความพร้อมด้านภาษา" : "Localization readiness"}</h2><p>{th ? "เริ่มจากประเทศไทยและขยายสู่อาเซียนได้" : "Thailand first, extensible to ASEAN"}</p></div><Globe2 size={17} /></div>
        <div className="setting-row"><div><strong>{th ? "ตลาดหลัก" : "Primary market"}</strong><span>{th ? "กำหนดจากการตั้งค่าพื้นที่ครอบคลุม" : "Driven by geographic coverage config"}</span></div><span className="badge green">{th ? "ประเทศไทย" : "Thailand"}</span></div>
        <div className="setting-row"><div><strong>{th ? "แบบอักษร" : "Typography"}</strong><span>Noto Sans Thai + Noto Sans</span></div><span className="badge">{th ? "รวมในระบบแล้ว" : "Bundled"}</span></div>
      </section>
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>{th ? "โหมดข้อมูล" : "Data mode"}</h2><p>{th ? "ผู้ให้บริการข้อมูลสาธารณะจริงโดยไม่ฝังคีย์ในระบบ" : "Real public providers with no embedded credentials"}</p></div><Database size={17} /></div>
        <div className="setting-row"><div><strong>{th ? "ข้อมูลเชิงลึกของพื้นที่" : "Location intelligence"}</strong><span>{th ? "ร้องขอจากผู้ให้บริการที่ตั้งค่าไว้" : "Requested from configured providers"}</span></div><span className="badge green">{th ? "API จริง" : "Real APIs"}</span></div>
        <div className="setting-row"><div><strong>{th ? "ข้อมูลบริษัท" : "Company records"}</strong><span>{th ? "ต้องใช้ Business REST API ของบริษัท" : "Requires the company Business REST API"}</span></div><span className={`badge ${businessConnected ? "green" : "amber"}`}>{businessConnected ? (th ? "ตั้งค่าแล้ว" : "Configured") : (th ? "ยังไม่เชื่อมต่อ" : "Not connected")}</span></div>
      </section>
    </div>

    <section className="card setting-card provider-card">
      <div className="card-head" style={{ padding: 0 }}><div><h2>{th ? "ความพร้อมของผู้ให้บริการภายนอก" : "External provider readiness"}</h2><p>{th ? "บริการฟรี/ทดลองสำหรับต้นแบบเพื่อการศึกษา ต้องตรวจสอบใบอนุญาตก่อนใช้จริง" : "Free/evaluation services for this educational prototype; production licensing must be reviewed"}</p></div><Cloud size={17} /></div>
      <div className="provider-table" role="list">
        {EXTERNAL_PROVIDERS.map((provider) => <div className="provider-row" role="listitem" key={provider.id}>
          <div><strong>{provider.name}</strong><span>{provider.capability}</span></div>
          <span className={`badge ${provider.status === "CONNECTED" ? "green" : provider.status === "OPTIONAL" ? "amber" : ""}`}>{provider.status}</span>
          <div className="provider-usage"><strong>{provider.keyRequired ? "Key required" : "No key"}</strong><span>{provider.prototypeUse}</span></div>
          <a href={provider.docsUrl} target="_blank" rel="noreferrer" aria-label={`${provider.name} official documentation`}>Official docs <ExternalLink /></a>
        </div>)}
      </div>
      <div className="callout warning provider-note">Public APIs have quotas and no guaranteed uptime. Site coordinates are sent only after the user presses “Load public data”. Do not submit personal or confidential locations. Demo scores remain estimates and are not automatically promoted to verified data.</div>
    </section>
    <ApiConnections language={language} />
  </main>;
}

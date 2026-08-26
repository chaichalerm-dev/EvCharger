"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Cloud, Database, ExternalLink, Globe2, Moon, ShieldCheck } from "lucide-react";
import { useApp } from "@/src/store/app-context";
import type { DemoRole } from "@/src/config/permissions";
import { EXTERNAL_PROVIDERS } from "@/src/config/external-providers";

export function SettingsView() {
  const [interactive, setInteractive] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, role, setRole } = useApp();
  useEffect(() => {
    const timer = window.setTimeout(() => setInteractive(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Experience controls</div><h1>Settings</h1><p className="page-subtitle">Language, theme, prototype access and external data providers</p></div></div>
    <div className="settings-grid">
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>Appearance</h2><p>Stored as a device-local preference</p></div><Moon size={17} /></div>
        <div className="setting-row"><div><strong>Color theme</strong><span>Light, dark or follow system</span></div><select className="select" disabled={!interactive} value={theme} onChange={(event) => setTheme(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div>
        <div className="setting-row"><div><strong>Language</strong><span>Interface language architecture</span></div><select className="select" disabled={!interactive} value={language} onChange={(event) => setLanguage(event.target.value as "en" | "th")}><option value="en">English</option><option value="th">ไทย</option></select></div>
      </section>
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>Prototype authorization</h2><p>UX-only permission demonstration</p></div><ShieldCheck size={17} /></div>
        <div className="setting-row"><div><strong>Demo role</strong><span>Not secure authentication</span></div><select className="select" disabled={!interactive} value={role} onChange={(event) => setRole(event.target.value as DemoRole)}>{["ADMIN", "BUSINESS_DEVELOPMENT", "ANALYST", "PARTNER", "VIEWER"].map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="callout warning" style={{ marginTop: 13 }}>Frontend role checks only control prototype UX. A future backend must independently authenticate users and enforce every authorization decision.</div>
      </section>
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>Localization readiness</h2><p>Thailand first, extensible to ASEAN</p></div><Globe2 size={17} /></div>
        <div className="setting-row"><div><strong>Primary market</strong><span>Driven by geographic coverage config</span></div><span className="badge green">Thailand</span></div>
        <div className="setting-row"><div><strong>Typography</strong><span>Noto Sans Thai + Noto Sans</span></div><span className="badge">Bundled</span></div>
      </section>
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>Data mode</h2><p>Mock repository plus optional public API snapshots</p></div><Database size={17} /></div>
        <div className="setting-row"><div><strong>Decision records</strong><span>Replaceable repository interfaces</span></div><span className="badge amber">Mock</span></div>
        <div className="setting-row"><div><strong>Public context</strong><span>Manual lookup; cached in browser memory</span></div><span className="badge green">Connected</span></div>
      </section>
    </div>

    <section className="card setting-card provider-card">
      <div className="card-head" style={{ padding: 0 }}><div><h2>External provider readiness</h2><p>Free/evaluation services for this educational prototype; production licensing must be reviewed</p></div><Cloud size={17} /></div>
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
  </main>;
}

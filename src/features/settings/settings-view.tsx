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

function ApiConnections() {
  const connections = useSyncExternalStore(subscribeApiConnections, getApiConnectionsSnapshot, getApiConnectionsSnapshot);
  const [endpoints, setEndpoints] = useState<Record<string, string>>(() => Object.fromEntries(EXTERNAL_PROVIDERS.map((provider) => [provider.runtimeId, connections[provider.runtimeId].endpoint])));
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<Record<string, string>>({});

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
    <div className="card-head" style={{ padding: 0 }}><div><h2>API Connections</h2><p>Change endpoints and replace expired or quota-limited API keys without editing code</p></div><KeyRound size={17} /></div>
    <div className="callout warning provider-note">Security: API keys are held only in page memory and are cleared on refresh. They are never written to localStorage, source code, Git, or the deployed Site. Browser-visible keys are suitable only for provider-approved public/client keys; production secrets require a backend proxy.</div>
    <div className="api-provider-list">
      {EXTERNAL_PROVIDERS.map((provider) => {
        const connection = connections[provider.runtimeId];
        const ready = connection.enabled && Boolean(connection.endpoint) && (!provider.keyRequired || Boolean(connection.token));
        return <article className="api-provider-editor" key={provider.runtimeId}>
          <header><div><strong>{provider.name}</strong><span>{provider.capability}</span></div><span className={`badge ${ready ? "green" : "amber"}`}>{ready ? "READY" : "TOKEN NEEDED"}</span></header>
          <label>Endpoint<input className="form-input" value={endpoints[provider.runtimeId] ?? connection.endpoint} onChange={(event) => setEndpoints((current) => ({ ...current, [provider.runtimeId]: event.target.value }))} spellCheck={false} /></label>
          <label>{provider.tokenLabel ?? "API token (not required)"}<input className="form-input" type="password" value={tokens[provider.runtimeId] ?? ""} onChange={(event) => setTokens((current) => ({ ...current, [provider.runtimeId]: event.target.value }))} placeholder={connection.token ? "Token configured — enter a replacement" : provider.keyRequired ? "Enter API key" : "Optional"} autoComplete="off" /></label>
          <div className="api-provider-actions">
            <label className="provider-toggle"><input type="checkbox" checked={connection.enabled} onChange={(event) => updateApiConnection(provider.runtimeId, { enabled: event.target.checked })} /> Enabled</label>
            <button className="btn primary" type="button" onClick={() => apply(provider.runtimeId)}><CheckCircle2 />Apply</button>
            {connection.token && <button className="btn" type="button" onClick={() => { updateApiConnection(provider.runtimeId, { token: "" }); setMessage((current) => ({ ...current, [provider.runtimeId]: "Token cleared" })); }}><Trash2 />Clear token</button>}
            <button className="btn" type="button" onClick={() => reset(provider.runtimeId)}><RotateCcw />Default</button>
          </div>
          <footer><span>{provider.freeLimit}</span>{message[provider.runtimeId] && <strong>{message[provider.runtimeId]}</strong>}</footer>
        </article>;
      })}
    </div>
    <button className="btn" type="button" onClick={() => { clearAllApiTokens(); setTokens({}); }}><Trash2 />Clear every in-memory token</button>
  </section>;
}

export function SettingsView() {
  const [interactive, setInteractive] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, role, setRole } = useApp();
  const connections = useSyncExternalStore(subscribeApiConnections, getApiConnectionsSnapshot, getApiConnectionsSnapshot);
  const businessConnected = connections["business-api"].enabled && Boolean(connections["business-api"].endpoint) && Boolean(connections["business-api"].token);
  useEffect(() => {
    const timer = window.setTimeout(() => setInteractive(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <main className="page">
    <div className="page-head"><div><div className="eyebrow">Experience controls</div><h1>Settings</h1><p className="page-subtitle">Language, theme, prototype access and external data providers</p></div></div>
    <div className="settings-grid">
      <section className="card setting-card">
        <div className="card-head" style={{ padding: 0 }}><div><h2>Appearance</h2><p>Stored as a device-local preference</p></div><Moon size={17} /></div>
        <div className="setting-row"><div><strong>Color theme</strong><span>Light, dark or follow system</span></div><select className="select" disabled={!interactive} value={interactive ? theme : "system"} onChange={(event) => setTheme(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div>
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
        <div className="card-head" style={{ padding: 0 }}><div><h2>Data mode</h2><p>Real public providers with no embedded credentials</p></div><Database size={17} /></div>
        <div className="setting-row"><div><strong>Location intelligence</strong><span>Requested from configured providers</span></div><span className="badge green">Real APIs</span></div>
        <div className="setting-row"><div><strong>Company records</strong><span>Requires the company Business REST API</span></div><span className={`badge ${businessConnected ? "green" : "amber"}`}>{businessConnected ? "Configured" : "Not connected"}</span></div>
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
    <ApiConnections />
  </main>;
}

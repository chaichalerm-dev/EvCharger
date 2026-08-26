"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Building2, ChevronDown, ClipboardList, Compass, Database, GitCompareArrows, Globe2, LayoutDashboard, Map, Menu, Moon, Search, Settings, ShieldCheck, Sun, Users, Waypoints, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useApp } from "@/src/store/app-context";
import { translate } from "@/src/lib/i18n";

const nav = [
  { section: "overview", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }, { href: "/map", label: "Map Explorer", icon: Map }, { href: "/expansion", label: "Expansion", icon: BarChart3 }] },
  { section: "intelligence", items: [{ href: "/sites", label: "Site Opportunities", icon: Compass }, { href: "/compare", label: "Compare Sites", icon: GitCompareArrows }, { href: "/analysis", label: "Analysis", icon: Waypoints }] },
  { section: "management", items: [{ href: "/partners", label: "Partners", icon: Users }, { href: "/branches", label: "Branches", icon: Building2 }, { href: "/opportunities", label: "Pipeline", icon: ClipboardList }] },
  { section: "system", items: [{ href: "/settings", label: "Settings", icon: Settings }, { href: "/demo", label: "Demo Controls", icon: Database }] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, role } = useApp();
  useEffect(() => { const timer = window.setTimeout(() => setInteractive(true), 0); return () => window.clearTimeout(timer); }, []);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? "mobile-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Zap size={21} /></div><div className="brand-copy"><div className="brand-title">EV Atlas</div><div className="brand-sub">Thailand Intelligence</div></div></div>
      <nav aria-label="Primary navigation">{nav.map(group => <div key={group.section}><div className="nav-section">{t(group.section as Parameters<typeof translate>[1])}</div>{group.items.map(item => { const Icon = item.icon; const active = path === item.href || (item.href !== "/" && path.startsWith(item.href)); return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}><Icon /><span>{item.label}</span></Link>; })}</div>)}</nav>
      <div className="sidebar-foot"><strong>REAL PROVIDER MODE</strong><p>Public data is fetched on demand. Company records require a configured Business API.</p></div>
    </aside>
    <div className="main-column">
      <header className="topbar">
        <button className="icon-btn mobile-menu" disabled={!interactive} onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-label="Open navigation"><Menu /></button>
        <div className="global-search"><Search /><input aria-label={t("search")} placeholder={t("search")} /><span className="search-key">⌘ K</span></div>
        <div className="top-actions">
          <button className="icon-btn" disabled={!interactive} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle color theme">{interactive && resolvedTheme === "dark" ? <Sun /> : <Moon />}</button>
          <button className="icon-btn" disabled={!interactive} onClick={() => setLanguage(language === "en" ? "th" : "en")} aria-label="Switch language"><Globe2 /></button>
          <div className="role-pill"><div className="avatar"><ShieldCheck size={16} /></div><div className="role-meta"><strong>{role.replaceAll("_", " ")}</strong><span>{t("prototypeAuth")}</span></div><ChevronDown size={13} /></div>
        </div>
      </header>
      {children}
    </div>
  </div>;
}

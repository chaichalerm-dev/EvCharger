"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Building2, ChevronDown, ClipboardList, Compass, Database, GitCompareArrows, Globe2, LayoutDashboard, Map, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings, ShieldCheck, Sun, Users, Waypoints, X, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useApp } from "@/src/store/app-context";
import { translate, type TranslationKey } from "@/src/lib/i18n";

const nav: { section: TranslationKey; items: { href: string; label: TranslationKey; icon: typeof LayoutDashboard }[] }[] = [
  { section: "overview", items: [{ href: "/", label: "dashboard", icon: LayoutDashboard }, { href: "/map", label: "mapExplorer", icon: Map }, { href: "/expansion", label: "expansion", icon: BarChart3 }] },
  { section: "intelligence", items: [{ href: "/sites", label: "siteOpportunities", icon: Compass }, { href: "/compare", label: "compareSites", icon: GitCompareArrows }, { href: "/analysis", label: "analysis", icon: Waypoints }] },
  { section: "management", items: [{ href: "/partners", label: "partners", icon: Users }, { href: "/branches", label: "branches", icon: Building2 }, { href: "/opportunities", label: "pipeline", icon: ClipboardList }] },
  { section: "system", items: [{ href: "/settings", label: "settings", icon: Settings }, { href: "/demo", label: "prototypeControls", icon: Database }] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, role } = useApp();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInteractive(true);
      setSidebarCollapsed(localStorage.getItem("evatlas.sidebarCollapsed") === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const toggleSidebar = () => setSidebarCollapsed((current) => {
    const next = !current;
    localStorage.setItem("evatlas.sidebarCollapsed", String(next));
    return next;
  });

  return <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
    <aside id="primary-sidebar" className={`sidebar ${menuOpen ? "mobile-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Zap size={21} /></div><div className="brand-copy"><div className="brand-title">EV Atlas</div><div className="brand-sub">Thailand Intelligence</div></div></div>
      <nav aria-label={t("primaryNavigation")}>{nav.map(group => <div key={group.section}><div className="nav-section">{t(group.section)}</div>{group.items.map(item => { const Icon = item.icon; const active = path === item.href || (item.href !== "/" && path.startsWith(item.href)); const label = t(item.label); return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} title={sidebarCollapsed ? label : undefined} aria-label={label} onClick={() => setMenuOpen(false)}><Icon /><span>{label}</span></Link>; })}</div>)}</nav>
      <div className="sidebar-foot"><strong>{t("realProviderMode")}</strong><p>{t("providerModeDescription")}</p></div>
    </aside>
    <div className="main-column">
      <header className="topbar">
        <button className="icon-btn sidebar-collapse-btn" disabled={!interactive} onClick={toggleSidebar} aria-label={t(sidebarCollapsed ? "expandSidebar" : "collapseSidebar")} title={t(sidebarCollapsed ? "expandSidebar" : "collapseSidebar")}>{sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
        <button className="icon-btn mobile-menu" disabled={!interactive} onClick={() => setMenuOpen(value => !value)} aria-controls="primary-sidebar" aria-expanded={menuOpen} aria-label={t(menuOpen ? "closeNavigation" : "openNavigation")}>{menuOpen ? <X /> : <Menu />}</button>
        <div className="global-search"><Search /><input aria-label={t("search")} placeholder={t("search")} /><span className="search-key">⌘ K</span></div>
        <div className="top-actions">
          <button className="icon-btn" disabled={!interactive} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={t("toggleTheme")}>{interactive && resolvedTheme === "dark" ? <Sun /> : <Moon />}</button>
          <button className="icon-btn" disabled={!interactive} onClick={() => setLanguage(language === "en" ? "th" : "en")} aria-label={t("switchLanguage")}><Globe2 /></button>
          <div className="role-pill"><div className="avatar"><ShieldCheck size={16} /></div><div className="role-meta"><strong>{role.replaceAll("_", " ")}</strong><span>{t("prototypeAuth")}</span></div><ChevronDown size={13} /></div>
        </div>
      </header>
      {children}
    </div>
  </div>;
}

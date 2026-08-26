"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { DemoRole, Permission } from "@/src/config/permissions";
import { ROLE_PERMISSIONS } from "@/src/config/permissions";

export type Language = "en" | "th";
export type FailureMode = "NONE" | "API_UNAVAILABLE" | "EMPTY_DATA" | "SLOW_LOADING" | "ANALYSIS_FAILURE";

interface AppState {
  language: Language;
  setLanguage: (value: Language) => void;
  role: DemoRole;
  setRole: (value: DemoRole) => void;
  hasPermission: (permission: Permission) => boolean;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  failureMode: FailureMode;
  setFailureMode: (value: FailureMode) => void;
}

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [role, setRoleState] = useState<DemoRole>("BUSINESS_DEVELOPMENT");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [failureMode, setFailureMode] = useState<FailureMode>("NONE");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLanguage = localStorage.getItem("evatlas.language") as Language | null;
      const savedRole = localStorage.getItem("evatlas.role") as DemoRole | null;
      if (savedLanguage === "en" || savedLanguage === "th") setLanguageState(savedLanguage);
      if (savedRole && savedRole in ROLE_PERMISSIONS) setRoleState(savedRole);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    localStorage.setItem("evatlas.language", value);
  };
  const setRole = (value: DemoRole) => {
    setRoleState(value);
    localStorage.setItem("evatlas.role", value);
  };
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  const value = useMemo(() => ({
    language,
    setLanguage,
    role,
    setRole,
    hasPermission: (permission: Permission) => ROLE_PERMISSIONS[role].includes(permission),
    compareIds,
    toggleCompare,
    failureMode,
    setFailureMode
  }), [language, role, compareIds, failureMode]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

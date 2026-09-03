"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { DemoRole, Permission } from "@/src/config/permissions";
import { ROLE_PERMISSIONS } from "@/src/config/permissions";

export type Language = "en" | "th";
// เตรียมไว้สำหรับจำลองสถานะความล้มเหลวของแต่ละหน้า แต่ยังไม่ถูกผูกกับ UI หรือ service ใดใช้งานจริง
// ความล้มเหลวจริงจะมาจาก error state ของแต่ละ hook เอง
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
  const [language, setLanguageState] = useState<Language>("th");
  const [role, setRoleState] = useState<DemoRole>("BUSINESS_DEVELOPMENT");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [failureMode, setFailureMode] = useState<FailureMode>("NONE");

  // อ่านค่าที่บันทึกไว้หลัง mount เท่านั้น (ไม่ใช่ใน useState initializer) เพื่อให้ markup จาก server
  // ตรงกับค่าเริ่มต้นไทย/สว่างเสมอ และไม่เกิด hydration mismatch
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLanguage = localStorage.getItem("evatlas.language") as Language | null;
      const savedRole = localStorage.getItem("evatlas.role") as DemoRole | null;
      if (savedLanguage === "en" || savedLanguage === "th") setLanguageState(savedLanguage);
      if (savedRole && savedRole in ROLE_PERMISSIONS) setRoleState(savedRole);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    localStorage.setItem("evatlas.language", value);
  };
  const setRole = (value: DemoRole) => {
    setRoleState(value);
    localStorage.setItem("evatlas.role", value);
  };
  // หน้าเปรียบเทียบแสดงผลแบบ 4 คอลัมน์คงที่ จึงเพิกเฉยรายการที่ 5 เงียบๆ แทนการแจ้ง error หรือ scroll
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  const value = useMemo(() => ({
    language,
    setLanguage,
    role,
    setRole,
    // ควบคุมแค่ฝั่ง UX เท่านั้น ระบบหลังบ้านในอนาคตต้องตรวจสิทธิ์ซ้ำทุก request ฝั่ง server
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

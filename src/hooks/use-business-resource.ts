"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getApiConnection, getApiConnectionRevision, subscribeApiConnections } from "@/src/services/api-connection.service";

export type BusinessResource = "sites" | "partners" | "branches" | "opportunities";

function normalizeBaseUrl(value: string) { return value.replace(/\/$/, ""); }

export function useBusinessResource<T>(resource: BusinessResource) {
  // subscribe การเปลี่ยนแปลงใน Settings (แก้ endpoint/token) เพื่อให้ทุกหน้าที่ใช้ hook นี้
  // ดึงข้อมูลใหม่อัตโนมัติเมื่อมีการตั้งค่า Business API ใหม่
  const revision = useSyncExternalStore(subscribeApiConnections, getApiConnectionRevision, getApiConnectionRevision);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // ไม่ได้ใช้ค่านี้ในเนื้อหาฟังก์ชัน — มีไว้เป็น dependency ของ useCallback เท่านั้น เพื่อให้ `load`
    // ได้ reference ใหม่ (และ effect ด้านล่างทำงานซ้ำ) ทุกครั้งที่การเชื่อมต่อ API เปลี่ยน
    void revision;
    const connection = getApiConnection("business-api");
    if (!connection.enabled || !connection.endpoint) {
      // ยังไม่ได้ตั้งค่า Business API: ถือเป็นสถานะว่างตามจริง ไม่ใช่ error (ดู AI.md ข้อ 5)
      setData([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${normalizeBaseUrl(connection.endpoint)}/${resource}`, {
        headers: { Accept: "application/json", ...(connection.token ? { Authorization: `Bearer ${connection.token}` } : {}) },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Business API returned HTTP ${response.status}`);
      const payload: unknown = await response.json();
      // รับได้ทั้ง JSON array ตรงๆ หรือรูปแบบห่อ { data: [] } — ทั้งสองแบบเป็น response ที่ยอมรับได้
      // ตามเอกสาร เพื่อไม่บังคับให้ผู้เชื่อมต่อต้องใช้รูปแบบเดียว
      const rows = Array.isArray(payload) ? payload : typeof payload === "object" && payload !== null && Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: T[] }).data : null;
      if (!rows) throw new Error("Business API response must be an array or { data: [] }");
      setData(rows as T[]);
    } catch (cause) {
      setData([]);
      setError(cause instanceof Error ? cause.message : "Business API request failed");
    } finally { setLoading(false); }
  }, [resource, revision]);

  useEffect(() => {
    // หน่วงด้วย setTimeout(0) เพื่อให้เริ่มดึงข้อมูลหลังจาก mount/hydration เสร็จแล้ว
    // ไม่ใช่ synchronous ระหว่าง render
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  return { data, loading, error, refresh: load };
}

"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getApiConnection, getApiConnectionRevision, subscribeApiConnections } from "@/src/services/api-connection.service";

export type BusinessResource = "sites" | "partners" | "branches" | "opportunities";

function normalizeBaseUrl(value: string) { return value.replace(/\/$/, ""); }

export function useBusinessResource<T>(resource: BusinessResource) {
  const revision = useSyncExternalStore(subscribeApiConnections, getApiConnectionRevision, getApiConnectionRevision);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    void revision;
    const connection = getApiConnection("business-api");
    if (!connection.enabled || !connection.endpoint) {
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
      const rows = Array.isArray(payload) ? payload : typeof payload === "object" && payload !== null && Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: T[] }).data : null;
      if (!rows) throw new Error("Business API response must be an array or { data: [] }");
      setData(rows as T[]);
    } catch (cause) {
      setData([]);
      setError(cause instanceof Error ? cause.message : "Business API request failed");
    } finally { setLoading(false); }
  }, [resource, revision]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  return { data, loading, error, refresh: load };
}

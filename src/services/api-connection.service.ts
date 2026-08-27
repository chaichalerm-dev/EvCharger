import { z } from "zod";

export type ApiProviderId =
  | "osm-tiles"
  | "openfreemap"
  | "mapterhorn-terrain"
  | "nominatim"
  | "overpass"
  | "open-meteo-weather"
  | "open-meteo-elevation"
  | "open-meteo-flood"
  | "worldpop"
  | "tomtom-traffic"
  | "business-api";

export interface ApiConnection {
  endpoint: string;
  token: string;
  enabled: boolean;
  updatedAt: string | null;
}

const endpointSchema = z.string().trim().url().max(500).refine((value) => {
  const url = new URL(value.replaceAll("{z}", "0").replaceAll("{x}", "0").replaceAll("{y}", "0"));
  return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
}, "Use HTTPS, or HTTP only for localhost development");

const defaults: Record<ApiProviderId, ApiConnection> = {
  "osm-tiles": { endpoint: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", token: "", enabled: true, updatedAt: null },
  openfreemap: { endpoint: "https://tiles.openfreemap.org/planet", token: "", enabled: true, updatedAt: null },
  "mapterhorn-terrain": { endpoint: "https://tiles.mapterhorn.com/tilejson.json", token: "", enabled: true, updatedAt: null },
  nominatim: { endpoint: "https://nominatim.openstreetmap.org/search", token: "", enabled: true, updatedAt: null },
  overpass: { endpoint: "https://overpass-api.de/api/interpreter", token: "", enabled: true, updatedAt: null },
  "open-meteo-weather": { endpoint: "https://api.open-meteo.com", token: "", enabled: true, updatedAt: null },
  "open-meteo-elevation": { endpoint: "https://api.open-meteo.com", token: "", enabled: true, updatedAt: null },
  "open-meteo-flood": { endpoint: "https://flood-api.open-meteo.com", token: "", enabled: true, updatedAt: null },
  worldpop: { endpoint: "https://api.worldpop.org/v2", token: "", enabled: true, updatedAt: null },
  "tomtom-traffic": { endpoint: "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/12/json", token: "", enabled: true, updatedAt: null },
  "business-api": { endpoint: "", token: "", enabled: false, updatedAt: null }
};

let connections = structuredClone(defaults);
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function getApiConnection(id: ApiProviderId): ApiConnection {
  return { ...connections[id] };
}

export function getApiConnectionRevision() {
  return revision;
}

export function getApiConnectionsSnapshot() {
  return connections;
}

export function subscribeApiConnections(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateApiConnection(id: ApiProviderId, patch: Partial<Pick<ApiConnection, "endpoint" | "token" | "enabled">>) {
  const endpoint = patch.endpoint == null ? connections[id].endpoint : endpointSchema.parse(patch.endpoint);
  const token = patch.token == null ? connections[id].token : patch.token.trim().slice(0, 1000);
  connections = { ...connections, [id]: { ...connections[id], ...patch, endpoint, token, updatedAt: new Date().toISOString() } };
  notify();
}

export function resetApiConnection(id: ApiProviderId) {
  connections = { ...connections, [id]: { ...defaults[id] } };
  notify();
}

export function clearAllApiTokens() {
  connections = Object.fromEntries(Object.entries(connections).map(([id, connection]) => [id, { ...connection, token: "", updatedAt: new Date().toISOString() }])) as Record<ApiProviderId, ApiConnection>;
  notify();
}

export function appendApiKey(url: URL, token: string) {
  if (token) url.searchParams.set("apikey", token);
  return url;
}

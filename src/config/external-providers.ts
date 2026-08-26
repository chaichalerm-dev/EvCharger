import type { ApiProviderId } from "@/src/services/api-connection.service";

export type ProviderStatus = "CONNECTED" | "OPTIONAL";

export interface ExternalProviderConfig {
  id: string;
  name: string;
  capability: string;
  status: ProviderStatus;
  keyRequired: boolean;
  prototypeUse: string;
  productionNote: string;
  docsUrl: string;
  runtimeId: ApiProviderId;
  tokenLabel?: string;
  freeLimit: string;
}

export const EXTERNAL_PROVIDERS: ExternalProviderConfig[] = [
  {
    id: "osm",
    name: "OpenStreetMap",
    capability: "2D basemap and attribution",
    status: "CONNECTED",
    keyRequired: false,
    prototypeUse: "Public tiles for an educational prototype",
    productionNote: "Move to a contracted or self-hosted tile provider before commercial scale.",
    docsUrl: "https://operations.osmfoundation.org/policies/tiles/"
    ,runtimeId: "osm-tiles", freeLimit: "Community tile policy; no SLA or bulk use"
  },
  {
    id: "openfreemap",
    name: "OpenFreeMap + MapLibre",
    capability: "3D OpenStreetMap building extrusions",
    status: "CONNECTED",
    keyRequired: false,
    prototypeUse: "On-demand 3D building view",
    productionNote: "Monitor availability and retain provider switching.",
    docsUrl: "https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/"
    ,runtimeId: "openfreemap", freeLimit: "Free public instance; no API key or SLA"
  },
  {
    id: "nominatim",
    name: "OSM Nominatim",
    capability: "Thailand place search",
    status: "CONNECTED",
    keyRequired: false,
    prototypeUse: "User-triggered search with caching; never autocomplete",
    productionNote: "Use a proxy/self-hosted or contracted geocoder at scale.",
    docsUrl: "https://operations.osmfoundation.org/policies/nominatim/"
    ,runtimeId: "nominatim", freeLimit: "Maximum 1 request/second; manual search only"
  },
  {
    id: "overpass",
    name: "Overpass API",
    capability: "Nearby EV chargers, fuel stations and POIs",
    status: "CONNECTED",
    keyRequired: false,
    prototypeUse: "Manual, bounded radius snapshots",
    productionNote: "Use scheduled ingestion or a managed/self-hosted instance for production.",
    docsUrl: "https://wiki.openstreetmap.org/wiki/Overpass_API"
    ,runtimeId: "overpass", freeLimit: "Shared public instances; bounded manual queries"
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    capability: "Weather, elevation and river-discharge context",
    status: "CONNECTED",
    keyRequired: false,
    prototypeUse: "Non-commercial evaluation with attribution",
    productionNote: "Commercial operation requires an appropriate licence/plan or self-hosting.",
    docsUrl: "https://open-meteo.com/en/docs",
    runtimeId: "open-meteo-weather", tokenLabel: "Commercial API key (optional)", freeLimit: "Non-commercial: 10,000 calls/day"
  },
  {
    id: "open-meteo-elevation", name: "Open-Meteo Elevation", capability: "Approximate terrain elevation",
    status: "CONNECTED", keyRequired: false, prototypeUse: "Requested only during area analysis",
    productionNote: "Not parcel-survey elevation.", docsUrl: "https://open-meteo.com/en/docs/elevation-api",
    runtimeId: "open-meteo-elevation", tokenLabel: "Commercial API key (optional)", freeLimit: "Shares Open-Meteo free limits"
  },
  {
    id: "open-meteo-flood", name: "Open-Meteo Flood / GloFAS", capability: "River-discharge forecast context",
    status: "CONNECTED", keyRequired: false, prototypeUse: "Requested only during area analysis",
    productionNote: "Not parcel-level flood certification.", docsUrl: "https://open-meteo.com/en/docs/flood-api",
    runtimeId: "open-meteo-flood", tokenLabel: "Commercial API key (optional)", freeLimit: "Shares Open-Meteo free limits"
  },
  {
    id: "worldpop", name: "WorldPop API v2", capability: "Population and density inside the selected radius",
    status: "CONNECTED", keyRequired: false, prototypeUse: "100m population task for the selected analysis polygon",
    productionNote: "Async results; cache and review dataset year.", docsUrl: "https://api.worldpop.org/v2/",
    runtimeId: "worldpop", tokenLabel: "X-API-Key (optional higher limit)", freeLimit: "1,000 requests/day without a key"
  },
  {
    id: "tomtom-traffic", name: "TomTom Traffic Flow", capability: "Observed and free-flow road speed",
    status: "OPTIONAL", keyRequired: true, prototypeUse: "Used when a user supplies a TomTom API key",
    productionNote: "Review coverage, attribution, licence and quota before commercial use.", docsUrl: "https://developer.tomtom.com/traffic-api/documentation/product-information/introduction",
    runtimeId: "tomtom-traffic", tokenLabel: "TomTom API key", freeLimit: "Developer allowance depends on the active TomTom plan"
  },
  {
    id: "business-api", name: "Company Business REST API", capability: "Partners, branches, opportunities and approvals",
    status: "OPTIONAL", keyRequired: true, prototypeUse: "Connect the company-owned API when its contract is available",
    productionNote: "Bearer tokens must move to secure server-side sessions in production.", docsUrl: "/docs/FUTURE-BACKEND.md",
    runtimeId: "business-api", tokenLabel: "Temporary bearer token", freeLimit: "Controlled by the company backend"
  }
];

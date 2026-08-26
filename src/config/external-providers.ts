export type ProviderStatus = "CONNECTED" | "OPTIONAL" | "FUTURE";

export interface ExternalProviderConfig {
  id: string;
  name: string;
  capability: string;
  status: ProviderStatus;
  keyRequired: boolean;
  prototypeUse: string;
  productionNote: string;
  docsUrl: string;
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
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    capability: "Weather, elevation and river-discharge context",
    status: "CONNECTED",
    keyRequired: false,
    prototypeUse: "Non-commercial evaluation with attribution",
    productionNote: "Commercial operation requires an appropriate licence/plan or self-hosting.",
    docsUrl: "https://open-meteo.com/en/docs"
  },
  {
    id: "maptiler",
    name: "MapTiler Cloud",
    capability: "Optional hosted 3D terrain and premium map styles",
    status: "OPTIONAL",
    keyRequired: true,
    prototypeUse: "Free-plan evaluation after the owner creates a restricted key",
    productionNote: "Free plan is non-commercial/evaluation and pauses at quota; review plan before launch.",
    docsUrl: "https://www.maptiler.com/cloud/pricing/"
  },
  {
    id: "traffic",
    name: "Traffic provider",
    capability: "Authoritative traffic speed and volume",
    status: "FUTURE",
    keyRequired: true,
    prototypeUse: "Not connected; demo factor remains estimated",
    productionNote: "Select a licensed provider after coverage and cost evaluation.",
    docsUrl: "https://github.com/open-traffic-generator"
  }
];

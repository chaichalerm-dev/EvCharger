"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ExpressionSpecification, GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import {
  AlertTriangle, ArrowRight, Box, Building2, CheckCircle2, ChevronDown, CircleDot, Database, Focus, Fuel,
  Gauge, Handshake, Layers3, LocateFixed, Map as MapIcon, MapPin, Mountain, RefreshCw, Search, Sparkles, Target, Thermometer, Users, Waves, Wind, Zap
} from "lucide-react";
import { RADIUS_OPTIONS_KM } from "@/src/config/business";
import { MAP_MARKER_STYLE, THAILAND_MAP_VIEW } from "@/src/config/geography";
import type { MapEntity } from "@/src/domain/models";
import type { PublicLocationContext } from "@/src/domain/public-api";
import { NominatimGeocodingProvider } from "@/src/providers/nominatim-geocoding.provider";
import { OverpassBuildingFootprintProvider } from "@/src/providers/osm-building.provider";
import { getPublicLocationContext } from "@/src/providers/public-location.providers";
import { getApiConnection } from "@/src/services/api-connection.service";
import { analyzeRealLocation } from "@/src/services/location-analysis.service";
import { recommendSite } from "@/src/services/recommendation-engine";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";
import { registerMapMarkerImages } from "./map-marker-icons";
import {
  circlePolygon,
  shouldRecenterForSelection,
  type MapSelectionOrigin,
} from "./map-selection";
import { ScoreBar } from "@/src/components/ui/score-bar";

const INITIAL_LOCATION = { id: "initial-bangna", label: "Bang Na, Bangkok", latitude: 13.6681, longitude: 100.6357, source: "INITIAL" as const };

function createBaseStyle(): StyleSpecification {
  const tiles = getApiConnection("osm-tiles");
  return {
  version: 8,
  sources: tiles.enabled ? {
    osm: {
      type: "raster",
      tiles: [tiles.endpoint],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors"
    }
  } : {},
  layers: [
    { id: "local-background", type: "background", paint: { "background-color": "#e7eff8" } },
    ...(tiles.enabled ? [{ id: "osm-tiles", type: "raster" as const, source: "osm", paint: { "raster-opacity": .94, "raster-fade-duration": 0 } }] : [])
  ]
  };
}

const LAYERS = [
  { id: "EV_STATION", label: "EV Stations", labelTh: "สถานีชาร์จ EV", color: "#0b84f3", icon: Zap, default: true },
  { id: "COMPETITOR", label: "Competitors", labelTh: "สถานีคู่แข่ง", color: "#d84f45", icon: Building2, default: true },
  { id: "GAS_STATION", label: "Gas Stations", labelTh: "ปั๊มน้ำมัน", color: "#c68100", icon: Fuel, default: true },
  { id: "POI", label: "Points of Interest", labelTh: "สถานที่สำคัญ", color: "#6d5ce7", icon: MapPin, default: true },
  { id: "FLOOD", label: "Flood Risk", labelTh: "พื้นที่เสี่ยงน้ำท่วม", color: "#6658c7", icon: Waves, default: false },
  { id: "PARTNER_BRANCH", label: "Partner Branches", labelTh: "สาขาพันธมิตร", color: "#8850ad", icon: Handshake, default: false },
  { id: "OPPORTUNITY", label: "Opportunities", labelTh: "พื้นที่โอกาส", color: "#00a9c9", icon: Target, default: true }
] as const;

type Candidate = { id: string; label: string; latitude: number; longitude: number; source: "INITIAL" | "OSM" | "MAP" };

const ENTITY_GLYPH_PATHS: Record<MapEntity["kind"], string[]> = {
  EV_STATION: ["M13 2 3 14h8l-2 8 12-14h-9z"],
  COMPETITOR: ["M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16", "M8 7h8M8 11h8M9 21v-5h6v5"],
  GAS_STATION: ["M3 21h12M5 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17M5 9h9", "M14 7h2l3 3v7a2 2 0 0 0 4 0v-5"],
  POI: ["M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 1 1 16 0", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6"],
  PARTNER_BRANCH: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M19 8v6M16 11h6"],
};

function createEntityGlyph(kind: MapEntity["kind"]) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  for (const pathData of ENTITY_GLYPH_PATHS[kind]) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
  }
  return svg;
}

function groupEntitiesByScreenCell(map: MapLibreMap, entities: MapEntity[]) {
  const zoom = map.getZoom();
  const cellSize = zoom < 10 ? 92 : zoom < 13 ? 72 : zoom < 15 ? 52 : 36;
  const groups = new Map<string, MapEntity[]>();
  for (const entity of entities) {
    const point = map.project([entity.longitude, entity.latitude]);
    const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
    groups.set(key, [...(groups.get(key) ?? []), entity]);
  }
  return [...groups.values()];
}

function zoomScaledValue(value: { overview: number; normal: number; detail: number }): ExpressionSpecification {
  return [
    "interpolate", ["linear"], ["zoom"],
    MAP_MARKER_STYLE.overviewZoom, value.overview,
    MAP_MARKER_STYLE.normalZoom, value.normal,
    MAP_MARKER_STYLE.detailZoom, value.detail
  ];
}

function projectRadiusPoints(map: MapLibreMap, location: { longitude: number; latitude: number }, radiusKm: number) {
  return circlePolygon(location.longitude, location.latitude, radiusKm).geometry.coordinates[0]
    .map(([longitude, latitude]) => {
      const point = map.project([longitude, latitude]);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function firstMapOverlayLayer(map: MapLibreMap) {
  return ["opportunity-clusters"]
    .find((layerId) => map.getLayer(layerId));
}

function ensure3DTerrain(map: MapLibreMap) {
  const connection = getApiConnection("mapterhorn-terrain");
  if (!connection.enabled || !connection.endpoint) return false;
  if (!map.getSource("mapterhorn-terrain")) {
    map.addSource("mapterhorn-terrain", { type: "raster-dem", url: connection.endpoint, tileSize: 512 });
  }
  const firstOverlayLayer = firstMapOverlayLayer(map);
  if (!map.getLayer("terrain-hillshade")) {
    map.addLayer({
      id: "terrain-hillshade",
      type: "hillshade",
      source: "mapterhorn-terrain",
      paint: {
        "hillshade-exaggeration": 0.28,
        "hillshade-shadow-color": "#1b3552",
        "hillshade-highlight-color": "#eef8ff",
        "hillshade-accent-color": "#6f91b0"
      }
    }, firstOverlayLayer);
  } else {
    map.setLayoutProperty("terrain-hillshade", "visibility", "visible");
  }
  map.setTerrain({ source: "mapterhorn-terrain", exaggeration: 1.15 });
  return true;
}

function ensure3DBuildings(map: MapLibreMap) {
  const connection = getApiConnection("openfreemap");
  if (!connection.enabled || !connection.endpoint) return false;
  if (!map.getSource("openfreemap-buildings")) {
    map.addSource("openfreemap-buildings", { type: "vector", url: connection.endpoint });
  }
  const firstOverlayLayer = firstMapOverlayLayer(map);
  if (!map.getLayer("3d-buildings")) {
    map.addLayer({
      id: "3d-buildings",
      type: "fill-extrusion",
      source: "openfreemap-buildings",
      "source-layer": "building",
      minzoom: 14,
      layout: { visibility: "none" },
      filter: ["!=", ["get", "hide_3d"], true],
      paint: {
        "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, "#b9d9f2", 40, "#4b93c8", 120, "#175b91"],
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.2, ["coalesce", ["get", "render_height"], 6]],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.94,
        "fill-extrusion-vertical-gradient": true
      }
    }, firstOverlayLayer);
  } else if (firstOverlayLayer) {
    map.moveLayer("3d-buildings", firstOverlayLayer);
  }
  return true;
}

function rendered3DBuildingCount(map: MapLibreMap) {
  return ["osm-buildings-3d", "3d-buildings"].reduce((total, layerId) => (
    total + (map.getLayer(layerId) ? map.queryRenderedFeatures({ layers: [layerId] }).length : 0)
  ), 0);
}

export function MapExplorer() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const selectedMarkerRef = useRef<MapLibreMarker | null>(null);
  const radiusOverlayRef = useRef<SVGSVGElement | null>(null);
  const radiusOverlayUpdaterRef = useRef<(() => void) | null>(null);
  const entityMarkersRef = useRef<MapLibreMarker[]>([]);
  const visibleEntitiesRef = useRef<MapEntity[]>([]);
  const renderEntityMarkersRef = useRef<(() => void) | null>(null);
  const loadBuildingFootprintsRef = useRef<((candidate: Candidate) => Promise<void>) | null>(null);
  const buildingRequestSequenceRef = useRef(0);
  const [location, setLocation] = useState<Candidate>(INITIAL_LOCATION);
  const locationRef = useRef<Candidate>(INITIAL_LOCATION);
  const [radius, setRadius] = useState<number>(3);
  const radiusRef = useRef<number>(3);
  const [area, setArea] = useState<string>("");
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [tileWarning, setTileWarning] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const is3DRef = useRef(false);
  const [threeDStatus, setThreeDStatus] = useState<"IDLE" | "LOADING" | "READY" | "TERRAIN_ONLY" | "UNAVAILABLE">("IDLE");
  const [threeDBuildingCount, setThreeDBuildingCount] = useState(0);
  const [publicContext, setPublicContext] = useState<PublicLocationContext | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [layerState, setLayerState] = useState<Record<string, boolean>>(() => Object.fromEntries(LAYERS.map((layer) => [layer.id, layer.default])));
  const { language } = useApp();
  const languageRef = useRef(language);
  const geocoder = useMemo(() => new NominatimGeocodingProvider(), []);
  const buildingProvider = useMemo(() => new OverpassBuildingFootprintProvider(), []);

  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => {
    const timer = window.setTimeout(() => setInteractive(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const localResults: Candidate[] = [];
  const displayedResults = remoteResults;

  const analysis = useMemo(() => analyzeRealLocation({
    label: location.label,
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm: radius,
    areaSqm: area ? Number(area) : undefined
  }, publicContext), [area, location, publicContext, radius]);
  const score = useMemo(() => calculateSiteScore(analysis.site.factors), [analysis.site.factors]);
  const recommendation = useMemo(() => recommendSite(analysis.site, score), [analysis.site, score]);
  const publicCounts = useMemo(() => ({
    evStations: publicContext?.osmEntities.filter((entity) => entity.kind === "EV_STATION").length ?? 0,
    gasStations: publicContext?.osmEntities.filter((entity) => entity.kind === "GAS_STATION").length ?? 0,
    pois: publicContext?.osmEntities.filter((entity) => entity.kind === "POI").length ?? 0
  }), [publicContext]);
  const publicLayerCounts = useMemo<Record<string, number | null>>(() => ({
    EV_STATION: publicContext ? publicCounts.evStations : null,
    COMPETITOR: publicContext ? analysis.counts.competitors : null,
    GAS_STATION: publicContext ? publicCounts.gasStations : null,
    POI: publicContext ? publicCounts.pois : null,
  }), [analysis.counts.competitors, publicContext, publicCounts]);

  const loadBuildingFootprints = async (candidate: Candidate) => {
    const map = mapRef.current;
    const source = map?.getSource("osm-building-footprints") as GeoJSONSource | undefined;
    if (!map || !source || !is3DRef.current) return;
    const requestSequence = ++buildingRequestSequenceRef.current;
    source.setData({ type: "FeatureCollection", features: [] });
    setThreeDBuildingCount(0);
    setThreeDStatus("LOADING");
    if (map.getLayer("3d-buildings")) map.setLayoutProperty("3d-buildings", "visibility", "visible");
    try {
      const collection = await buildingProvider.nearby({ latitude: candidate.latitude, longitude: candidate.longitude });
      if (requestSequence !== buildingRequestSequenceRef.current || !is3DRef.current) return;
      source.setData(collection);
      setThreeDBuildingCount(collection.features.length);
      if (map.getLayer("osm-buildings-3d")) map.setLayoutProperty("osm-buildings-3d", "visibility", collection.features.length ? "visible" : "none");
      if (collection.features.length) {
        if (map.getLayer("3d-buildings")) map.setLayoutProperty("3d-buildings", "visibility", "none");
        setThreeDStatus("READY");
      } else {
        setThreeDStatus(map.getTerrain()?.source ? "TERRAIN_ONLY" : "UNAVAILABLE");
      }
    } catch (error) {
      if (requestSequence !== buildingRequestSequenceRef.current || !is3DRef.current) return;
      console.warn("Unable to load bounded OSM building footprints", error);
      setThreeDStatus(rendered3DBuildingCount(map) > 0 ? "READY" : map.getTerrain()?.source ? "TERRAIN_ONLY" : "UNAVAILABLE");
    }
  };
  useEffect(() => {
    loadBuildingFootprintsRef.current = loadBuildingFootprints;
  });

  const chooseLocation = (candidate: Candidate, origin: MapSelectionOrigin = "SEARCH") => {
    locationRef.current = candidate;
    setLocation(candidate);
    setPublicContext(null);
    setQuery("");
    setRemoteResults([]);
    setSearchMessage(languageRef.current === "th" ? "เลือกพื้นที่แล้ว — เลือกรัศมี แล้วกดวิเคราะห์พื้นที่นี้" : "Location selected — choose a radius, then analyze this area");
    if (is3DRef.current) void loadBuildingFootprintsRef.current?.(candidate);
    if (shouldRecenterForSelection(origin)) {
      mapRef.current?.easeTo({
        center: [candidate.longitude, candidate.latitude],
        zoom: is3DRef.current ? 16.5 : 13.5,
        pitch: is3DRef.current ? 65 : 0,
        bearing: is3DRef.current ? -24 : 0,
        duration: 650
      });
    }
  };

  const changeRadius = (value: number) => {
    radiusRef.current = value;
    setRadius(value);
    setPublicContext(null);
  };

  const loadPublicData = async () => {
    setPublicLoading(true);
    try {
      const context = await getPublicLocationContext({ latitude: location.latitude, longitude: location.longitude }, radius);
      setPublicContext(context);
    } finally {
      setPublicLoading(false);
    }
  };

  const toggle3D = () => {
    const map = mapRef.current;
    const next = !is3D;
    setIs3D(next);
    is3DRef.current = next;
    if (!map) {
      setThreeDStatus(next ? "UNAVAILABLE" : "IDLE");
      return;
    }
    const applyMode = () => {
      if (!map.getLayer("opportunity-points")) return false;
      if (next) {
        let terrainEnabled = false;
        let buildingsEnabled = false;
        try { terrainEnabled = ensure3DTerrain(map); } catch (error) { console.warn("Unable to enable Mapterhorn terrain", error); }
        try { buildingsEnabled = ensure3DBuildings(map); } catch (error) { console.warn("Unable to enable OpenFreeMap buildings", error); }
        const firstOverlayLayer = firstMapOverlayLayer(map);
        if (map.getLayer("osm-buildings-3d") && firstOverlayLayer) map.moveLayer("osm-buildings-3d", firstOverlayLayer);
        if (!terrainEnabled && !buildingsEnabled) {
          setThreeDStatus("UNAVAILABLE");
          return false;
        }
        void loadBuildingFootprints(locationRef.current);
      } else {
        buildingRequestSequenceRef.current += 1;
        setThreeDBuildingCount(0);
        map.setTerrain(null);
        if (map.getLayer("terrain-hillshade")) map.setLayoutProperty("terrain-hillshade", "visibility", "none");
      }
      if (map.getLayer("3d-buildings")) map.setLayoutProperty("3d-buildings", "visibility", next ? "visible" : "none");
      if (map.getLayer("osm-buildings-3d")) map.setLayoutProperty("osm-buildings-3d", "visibility", next ? "visible" : "none");
      map.easeTo({
        center: [location.longitude, location.latitude],
        pitch: next ? 65 : 0,
        bearing: next ? -24 : 0,
        zoom: next ? Math.max(map.getZoom(), 16.5) : Math.min(map.getZoom(), 14),
        duration: 700
      });
      setThreeDStatus(next ? "LOADING" : "IDLE");
      return true;
    };
    if (!applyMode() && next) {
      setThreeDStatus("LOADING");
      window.setTimeout(() => {
        if (!is3DRef.current) return;
        if (!applyMode()) setThreeDStatus("UNAVAILABLE");
      }, 1200);
    }
  };

  const searchPlaces = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) return;
    if (localResults.length === 1) {
      chooseLocation(localResults[0]);
      return;
    }
    setSearching(true);
    setSearchMessage(language === "th" ? "กำลังค้นหาพื้นที่ในประเทศไทย…" : "Searching locations in Thailand…");
    const results = await geocoder.search(query);
    setRemoteResults(results.map((result, index) => ({ id: `osm-${index}`, ...result, source: "OSM" as const })));
    setSearching(false);
    if (!results.length && !localResults.length) setSearchMessage(language === "th" ? "ไม่พบพื้นที่ ลองชื่อเขต จังหวัด หรือพิกัดบนแผนที่" : "No place found. Try a district, province, or click the map.");
    else setSearchMessage("");
  };

  useEffect(() => {
    let cancelled = false;
    void import("maplibre-gl").then((maplibregl) => {
    if (cancelled || !container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: createBaseStyle(),
      center: [INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude],
      zoom: 12.2,
      minZoom: THAILAND_MAP_VIEW.minZoom,
      maxZoom: THAILAND_MAP_VIEW.maxZoom,
      maxBounds: THAILAND_MAP_VIEW.bounds,
      renderWorldCopies: THAILAND_MAP_VIEW.renderWorldCopies,
      maxPitch: 75,
      attributionControl: false,
      canvasContextAttributes: { antialias: true }
    });
    mapRef.current = map;
    const selectedLocation = locationRef.current;
    const selectedMarker = new maplibregl.Marker({
      color: "#087ff0",
      scale: 0.82,
      anchor: "bottom",
      pitchAlignment: "viewport",
      rotationAlignment: "viewport",
    })
      .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
      .addTo(map);
    const selectedMarkerElement = selectedMarker.getElement();
    selectedMarkerElement.classList.add("selected-map-marker");
    selectedMarkerElement.dataset.latitude = selectedLocation.latitude.toFixed(5);
    selectedMarkerElement.dataset.longitude = selectedLocation.longitude.toFixed(5);
    selectedMarkerElement.setAttribute("role", "img");
    selectedMarkerElement.setAttribute("aria-label", languageRef.current === "th" ? `ตำแหน่งที่เลือก ${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}` : `Selected location ${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`);
    selectedMarkerRef.current = selectedMarker;

    const radiusOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    radiusOverlay.classList.add("analysis-radius-overlay");
    radiusOverlay.setAttribute("aria-hidden", "true");
    const radiusFill = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const radiusCasing = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const radiusLine = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    radiusFill.classList.add("analysis-radius-fill");
    radiusCasing.classList.add("analysis-radius-casing");
    radiusLine.classList.add("analysis-radius-line");
    radiusOverlay.appendChild(radiusFill);
    radiusOverlay.appendChild(radiusCasing);
    radiusOverlay.appendChild(radiusLine);
    map.getContainer().appendChild(radiusOverlay);
    radiusOverlayRef.current = radiusOverlay;

    const updateRadiusOverlay = () => {
      const mapContainer = map.getContainer();
      radiusOverlay.setAttribute("viewBox", `0 0 ${mapContainer.clientWidth} ${mapContainer.clientHeight}`);
      const points = projectRadiusPoints(map, locationRef.current, radiusRef.current);
      radiusFill.setAttribute("points", points);
      radiusCasing.setAttribute("points", points);
      radiusLine.setAttribute("points", points);
      radiusOverlay.dataset.radiusKm = String(radiusRef.current);
    };
    radiusOverlayUpdaterRef.current = updateRadiusOverlay;
    map.on("move", updateRadiusOverlay);
    map.on("resize", updateRadiusOverlay);
    updateRadiusOverlay();

    const renderEntityMarkers = () => {
      entityMarkersRef.current.forEach((marker) => marker.remove());
      entityMarkersRef.current = [];
      const entities = visibleEntitiesRef.current;
      if (!entities.length) return;
      const groups = groupEntitiesByScreenCell(map, entities);
      entityMarkersRef.current = groups.map((group) => {
        const longitude = group.reduce((total, entity) => total + entity.longitude, 0) / group.length;
        const latitude = group.reduce((total, entity) => total + entity.latitude, 0) / group.length;
        if (group.length > 1) {
          const clusterButton = document.createElement("button");
          clusterButton.type = "button";
          clusterButton.className = "map-entity-cluster";
          clusterButton.textContent = String(group.length);
          clusterButton.setAttribute("aria-label", languageRef.current === "th" ? `กลุ่มสถานที่ ${group.length} จุด` : `${group.length} nearby locations`);
          clusterButton.addEventListener("click", (event) => {
            event.stopPropagation();
            map.easeTo({ center: [longitude, latitude], zoom: Math.min(map.getZoom() + 2, 17), duration: 450 });
          });
          return new maplibregl.Marker({ element: clusterButton, anchor: "center", pitchAlignment: "viewport", rotationAlignment: "viewport" })
            .setLngLat([longitude, latitude]).addTo(map);
        }
        const entity = group[0];
        const markerButton = document.createElement("button");
        markerButton.type = "button";
        markerButton.className = "map-entity-marker";
        markerButton.dataset.kind = entity.kind;
        markerButton.appendChild(createEntityGlyph(entity.kind));
        const markerLabel = `${entity.name}${entity.brand ? ` · ${entity.brand}` : ""}`;
        markerButton.setAttribute("aria-label", markerLabel);
        markerButton.title = markerLabel;
        markerButton.addEventListener("click", (event) => {
          event.stopPropagation();
          new maplibregl.Popup({ offset: 18 }).setLngLat([entity.longitude, entity.latitude]).setText(markerLabel).addTo(map);
        });
        return new maplibregl.Marker({ element: markerButton, anchor: "center", pitchAlignment: "viewport", rotationAlignment: "viewport" })
          .setLngLat([entity.longitude, entity.latitude]).addTo(map);
      });
    };
    renderEntityMarkersRef.current = renderEntityMarkers;
    map.on("moveend", renderEntityMarkers);
    map.on("zoomend", renderEntityMarkers);
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("error", (event) => {
      const message = String(event.error?.message ?? "").toLowerCase();
      if (message.includes("openfreemap")) setThreeDStatus(rendered3DBuildingCount(map) > 0 ? "READY" : map.getTerrain()?.source ? "TERRAIN_ONLY" : "UNAVAILABLE");
      else if (message.includes("mapterhorn")) {
        const hasBuildings = rendered3DBuildingCount(map) > 0;
        setThreeDStatus(hasBuildings ? "READY" : "UNAVAILABLE");
      } else if (message.includes("tile") && !is3DRef.current) setTileWarning(true);
    });
    map.on("idle", () => {
      if (map.getSource("osm") && map.isSourceLoaded("osm") && map.areTilesLoaded()) {
        setTileWarning(false);
      }
      if (is3DRef.current) {
        const featureCount = rendered3DBuildingCount(map);
        const terrainConfigured = Boolean(map.getTerrain()?.source);
        setThreeDStatus(featureCount > 0 ? "READY" : terrainConfigured ? "TERRAIN_ONLY" : "UNAVAILABLE");
      }
    });
    map.on("sourcedata", (event) => {
      if (["openfreemap-buildings", "osm-building-footprints"].includes(event.sourceId) && event.isSourceLoaded) {
        const featureCount = rendered3DBuildingCount(map);
        setThreeDStatus(featureCount > 0 ? "READY" : map.getTerrain()?.source ? "TERRAIN_ONLY" : "UNAVAILABLE");
      }
    });
    map.on("style.load", () => {
      if (map.getSource("opportunities")) {
        setMapReady(true);
        return;
      }
      registerMapMarkerImages(map);
      const opportunities = {
        type: "FeatureCollection" as const,
        features: []
      };
      map.addSource("opportunities", { type: "geojson", data: opportunities, cluster: true, clusterRadius: 34, clusterMaxZoom: 11 });
      map.addLayer({ id: "opportunity-clusters", type: "symbol", source: "opportunities", filter: ["has", "point_count"], layout: { "icon-image": "marker-cluster", "icon-size": zoomScaledValue(MAP_MARKER_STYLE.clusterIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "text-field": ["get", "point_count_abbreviated"], "text-size": zoomScaledValue(MAP_MARKER_STYLE.clusterTextSize), "text-allow-overlap": true, "text-pitch-alignment": "viewport" }, paint: { "text-color": "#fff" } });
      map.addLayer({ id: "opportunity-points", type: "symbol", source: "opportunities", filter: ["!", ["has", "point_count"]], layout: { "icon-image": "marker-opportunity", "icon-size": zoomScaledValue(MAP_MARKER_STYLE.opportunityIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "icon-allow-overlap": false } });
      map.addSource("osm-building-footprints", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "osm-buildings-3d",
        type: "fill-extrusion",
        source: "osm-building-footprints",
        minzoom: 14,
        layout: { visibility: "none" },
        paint: {
          "fill-extrusion-color": ["case", ["==", ["get", "selected"], true], "#00b8f0", ["interpolate", ["linear"], ["get", "heightMeters"], 0, "#c8e9fa", 40, "#4b9ed1", 120, "#155c91"]],
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.2, ["get", "heightMeters"]],
          "fill-extrusion-base": ["get", "minHeightMeters"],
          "fill-extrusion-opacity": 0.92,
          "fill-extrusion-vertical-gradient": true,
        },
      }, "opportunity-clusters");

      map.on("click", (event) => {
        const hits = map.queryRenderedFeatures(event.point, { layers: ["opportunity-points"] });
        if (hits.length) return;
        chooseLocation({
          id: `map-${event.lngLat.lat.toFixed(5)}-${event.lngLat.lng.toFixed(5)}`,
          label: languageRef.current === "th" ? `จุดที่เลือก ${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}` : `Selected point ${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}`,
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
          source: "MAP"
        }, "MAP");
      });
      map.on("mouseenter", "opportunity-points", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "opportunity-points", () => { map.getCanvas().style.cursor = "crosshair"; });
      map.getCanvas().style.cursor = "crosshair";
      setMapReady(true);
    });
    });
    return () => {
      cancelled = true;
      const currentMap = mapRef.current;
      const radiusOverlayUpdater = radiusOverlayUpdaterRef.current;
      if (currentMap && radiusOverlayUpdater) {
        currentMap.off("move", radiusOverlayUpdater);
        currentMap.off("resize", radiusOverlayUpdater);
      }
      radiusOverlayRef.current?.remove();
      radiusOverlayRef.current = null;
      radiusOverlayUpdaterRef.current = null;
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
      entityMarkersRef.current.forEach((marker) => marker.remove());
      entityMarkersRef.current = [];
      visibleEntitiesRef.current = [];
      renderEntityMarkersRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    selectedMarkerRef.current?.setLngLat([location.longitude, location.latitude]);
    radiusOverlayUpdaterRef.current?.();
    const markerElement = selectedMarkerRef.current?.getElement();
    if (markerElement) {
      markerElement.dataset.latitude = location.latitude.toFixed(5);
      markerElement.dataset.longitude = location.longitude.toFixed(5);
      markerElement.setAttribute("aria-label", language === "th" ? `ตำแหน่งที่เลือก ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : `Selected location ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`);
    }
  }, [language, location, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const enabledEntityKinds = new Set(Object.entries(layerState).filter(([, enabled]) => enabled).map(([id]) => id));
    const entities = (publicContext?.osmEntities ?? []).filter((entity) => enabledEntityKinds.has(entity.kind));
    visibleEntitiesRef.current = entities;
    renderEntityMarkersRef.current?.();
    const opportunityVisibility = layerState.OPPORTUNITY ? "visible" : "none";
    ["opportunity-points", "opportunity-clusters"].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", opportunityVisibility);
    });
    radiusOverlayRef.current?.classList.toggle("show-flood-risk", layerState.FLOOD);
  }, [language, layerState, publicContext]);

  const t = {
    title: language === "th" ? "ค้นหาพื้นที่ที่สนใจ" : "Find a location",
    subtitle: language === "th" ? "เริ่มจากพิมพ์ชื่อสถานที่ หรือคลิกจุดบนแผนที่" : "Start by searching a place or clicking the map",
    searchPlaceholder: language === "th" ? "เช่น บางนา, อโศก, ศรีราชา หรือชื่อสถานที่" : "Try Bang Na, Asok, Si Racha or an address",
    analyze: language === "th" ? "ค้นหา" : "Search",
    area: language === "th" ? "พื้นที่ว่าง (ตร.ม.) — ไม่บังคับ" : "Available area (m²) — optional",
    result: language === "th" ? "ผลวิเคราะห์พื้นที่" : "Location analysis",
    estimated: language === "th" ? "ค่าประเมิน" : "Estimated",
    survey: language === "th" ? "ต้องสำรวจพื้นที่จริง" : "Requires site survey"
  };
  const locationChosen = location.source !== "INITIAL";
  const currentJourneyStep = publicContext ? 3 : locationChosen ? 2 : 1;
  const journeySteps = [
    language === "th" ? "เลือกพื้นที่" : "Select location",
    language === "th" ? "กำหนดขอบเขต" : "Set analysis area",
    language === "th" ? "ดูผลและคำแนะนำ" : "Review recommendation",
  ];

  return <main className="map-page simple-map-page">
    <section className="map-toolbar simple-map-toolbar">
      <div className="map-title"><span className="eyebrow">{language === "th" ? "เริ่มวิเคราะห์พื้นที่" : "Start location analysis"}</span><h1>{t.title}</h1><p>{t.subtitle}</p></div>
      <form className="map-search-form" onSubmit={searchPlaces}>
        <div className="map-search">
          <Search />
          <input disabled={!interactive} value={query} onChange={(event) => { setQuery(event.target.value); setRemoteResults([]); setSearchMessage(""); }} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} />
          {query && <div className="search-results">
            {displayedResults.map((candidate) => <button type="button" key={`${candidate.source}-${candidate.id}`} onClick={() => chooseLocation(candidate)}>
              <MapPin /><span><strong>{candidate.label}</strong><small>OpenStreetMap Nominatim</small></span>
            </button>)}
            {!displayedResults.length && !searching && <p>{language === "th" ? "กด “ค้นหา” เพื่อค้นหาชื่อสถานที่ในประเทศไทย" : "Press Search to look up places in Thailand"}</p>}
          </div>}
        </div>
        <button className="btn primary search-submit" type="submit" disabled={!interactive || searching || query.trim().length < 2}>{searching ? "…" : t.analyze}</button>
      </form>
    </section>

    <section className="map-journey" aria-label={language === "th" ? "ขั้นตอนการวิเคราะห์พื้นที่" : "Location analysis steps"}>
      <div className="journey-steps">{journeySteps.map((label, index) => { const step = index + 1; return <div className={`journey-step ${step < currentJourneyStep ? "complete" : ""} ${step === currentJourneyStep ? "active" : ""}`} key={label}><span>{step < currentJourneyStep ? <CheckCircle2 /> : step}</span><strong>{label}</strong>{index < journeySteps.length - 1 && <i />}</div>; })}</div>
      <div className="journey-data-note"><Database />{language === "th" ? "ดึงข้อมูลจริงเมื่อกดวิเคราะห์ · ต้องสำรวจพื้นที่ก่อนลงทุน" : "Provider data loads on analysis · site survey required"}</div>
    </section>
    {searchMessage && <div className="map-status" role="status"><CheckCircle2 />{searchMessage}</div>}

    <section className="map-workspace simple-map-workspace">
      <aside className="map-panel analysis-controls">
        <div className="selected-location-card">
          <div><span>{language === "th" ? "พื้นที่ที่เลือก" : "Selected location"}</span><small className={locationChosen ? "selected" : "sample"}>{locationChosen ? (language === "th" ? "เลือกแล้ว" : "Selected") : (language === "th" ? "พื้นที่ตัวอย่าง" : "Example")}</small></div>
          <strong><LocateFixed />{location.label}</strong><p>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
          <small>{language === "th" ? "ค้นหาด้านบน หรือคลิกจุดใหม่บนแผนที่" : "Search above or click a new point on the map"}</small>
        </div>

        <div className="step-label control-step"><span>2</span>{language === "th" ? "กำหนดขอบเขตวิเคราะห์" : "Set the analysis area"}</div>
        <div className="radius-options large">{RADIUS_OPTIONS_KM.map((value) => <button className={radius === value ? "active" : ""} onClick={() => changeRadius(value)} key={value}>{value} km</button>)}</div>
        <label className="area-input control-area"><span>{t.area}</span><input inputMode="numeric" min="1" max="1000000" type="number" value={area} onChange={(event) => setArea(event.target.value)} placeholder={language === "th" ? "เช่น 600" : "e.g. 600"} /></label>
        <button className={`btn primary analyze-area-btn ${publicContext ? "analyzed" : ""}`} type="button" onClick={loadPublicData} disabled={publicLoading}>
          {publicLoading ? <><RefreshCw className="spin" />{language === "th" ? "กำลังวิเคราะห์…" : "Analyzing…"}</> : publicContext ? <><RefreshCw />{language === "th" ? "อัปเดตผลวิเคราะห์" : "Refresh analysis"}</> : <><Sparkles />{language === "th" ? "วิเคราะห์พื้นที่นี้" : "Analyze this area"}<ArrowRight /></>}
        </button>
        {!publicContext && <p className="analyze-helper">{language === "th" ? "ขั้นตอนถัดไป: กดปุ่มนี้เพื่อดึงข้อมูลและคำนวณคะแนน" : "Next: press this button to load data and calculate the score"}</p>}

        <section className="layer-panel" aria-labelledby="map-layers-title">
          <div className="layer-panel-heading"><strong id="map-layers-title"><Layers3 />{language === "th" ? "ชั้นข้อมูลบนแผนที่" : "Map layers"}</strong><span>{Object.values(layerState).filter(Boolean).length}/{LAYERS.length}</span></div>
          <p className="layer-hint">{language === "th" ? "ไอคอนเดียวกับที่แสดงบนแผนที่" : "Icons match the symbols shown on the map"}</p>
          <div className="layer-list">{LAYERS.map((layer) => { const enabled = layerState[layer.id]; const LayerIcon = layer.icon; const count = publicLayerCounts[layer.id]; const countLabel = count == null ? (language === "th" ? "รอโหลด" : "Pending") : language === "th" ? `${count} จุด` : `${count} items`; return <label className={`layer-row ${enabled ? "enabled" : "disabled"}`} key={layer.id}><input type="checkbox" checked={enabled} onChange={() => setLayerState((current) => ({ ...current, [layer.id]: !current[layer.id] }))} /><span className="layer-icon" style={{ color: layer.color }}><LayerIcon aria-hidden="true" /></span><span className="layer-name">{language === "th" ? layer.labelTh : layer.label}</span><small>{enabled ? (layer.id in publicLayerCounts ? countLabel : (language === "th" ? "แสดง" : "On")) : (language === "th" ? "ซ่อน" : "Off")}</small></label>; })}</div>
        </section>
      </aside>

      <div className="map-canvas-wrap">
        <div ref={container} className="map-canvas" data-country={THAILAND_MAP_VIEW.countryCode} aria-label={language === "th" ? "แผนที่เลือกพื้นที่สำหรับวิเคราะห์" : "Interactive map for selecting an analysis location"} />
        <div className={`map-symbol-legend ${legendOpen ? "open" : "collapsed"}`} aria-label={language === "th" ? "คำอธิบายสัญลักษณ์บนแผนที่" : "Map symbol legend"}>
          <button className="legend-toggle" type="button" onClick={() => setLegendOpen((current) => !current)} aria-expanded={legendOpen}>
            <Layers3 /><span>{language === "th" ? "สัญลักษณ์" : "Symbols"}</span><small>{Object.values(layerState).filter(Boolean).length}/{LAYERS.length}</small><ChevronDown aria-hidden="true" />
          </button>
          {legendOpen && <div className="legend-items">{LAYERS.map((layer) => { const enabled = layerState[layer.id]; const LayerIcon = layer.icon; return <span className={`map-symbol-item ${enabled ? "enabled" : "disabled"}`} key={layer.id}><i style={{ color: layer.color }}><LayerIcon aria-hidden="true" /></i>{language === "th" ? layer.labelTh : layer.label}</span>; })}</div>}
        </div>
        {tileWarning && <div className="tile-warning"><AlertTriangle />{language === "th" ? "แผนที่ถนนออนไลน์ไม่พร้อม — ยังเลือกจุดบนแผนที่สาธิตได้" : "Online road tiles unavailable — demo map selection still works"}</div>}
        <button className={`map-float-btn map-icon-btn map-3d-btn ${is3D ? "active" : ""}`} onClick={toggle3D} aria-pressed={is3D} disabled={!mapReady} aria-label={language === "th" ? (is3D ? "เปลี่ยนเป็นแผนที่ 2D" : "เปิดแผนที่ 3D") : (is3D ? "Switch to 2D map" : "Enable 3D map")} title={language === "th" ? (is3D ? "เปลี่ยนเป็นแผนที่ 2D" : "เปิดแผนที่ 3D") : (is3D ? "Switch to 2D map" : "Enable 3D map")}>{is3D ? <MapIcon /> : <Box />}</button>
        {is3D && <div className={`map-3d-status status-${threeDStatus.toLowerCase()}`} data-3d-status={threeDStatus} data-building-count={threeDBuildingCount}><Box />{
          threeDStatus === "READY" ? (language === "th" ? `${threeDBuildingCount ? `${threeDBuildingCount} ` : ""}อาคาร OSM 3D พร้อม · รูปทรง/ความสูงที่ไม่มีข้อมูลเป็นค่าประมาณ` : `${threeDBuildingCount ? `${threeDBuildingCount} ` : ""}OSM buildings ready · missing shapes/heights are estimated`)
            : threeDStatus === "TERRAIN_ONLY" ? (language === "th" ? "ภูมิประเทศ 3D พร้อม · ไม่พบข้อมูลความสูงอาคารบริเวณนี้" : "3D terrain ready · no building-height data in this view")
              : threeDStatus === "LOADING" ? (language === "th" ? "กำลังโหลดภูมิประเทศและอาคาร 3D…" : "Loading 3D terrain and buildings…")
                : (language === "th" ? "ผู้ให้บริการข้อมูล 3D ไม่พร้อม" : "3D providers unavailable")
        }</div>}
        <button className="map-float-btn map-icon-btn map-center-btn" disabled={!mapReady} aria-label={language === "th" ? "กลับไปจุดที่เลือก" : "Center selected point"} title={language === "th" ? "กลับไปจุดที่เลือก" : "Center selected point"} onClick={() => mapRef.current?.easeTo({ center: [location.longitude, location.latitude], zoom: is3D ? 16.5 : 13.5, pitch: is3D ? 65 : 0, bearing: is3D ? -24 : 0, duration: 500 })}><Focus /></button>
      </div>

      <aside className="map-panel site-panel result-panel">
        <div className="result-heading"><div><span className="step-label compact"><span>3</span>{t.result}</span><small>{publicContext ? (language === "th" ? "ผลวิเคราะห์พร้อมแล้ว" : "ANALYSIS READY") : (language === "th" ? "รอการวิเคราะห์" : "READY TO ANALYZE")}</small></div><div className="score-block"><strong>{publicContext ? score.overall : "—"}</strong>{publicContext && <span>/100</span>}</div></div>
        <h2>{analysis.site.name}</h2>
        <p>{radius} km radius · {analysis.site.province} · {analysis.site.district}</p>
        <div className={`recommendation-strip ${recommendation.overridden ? "warning" : ""}`}><span>{language === "th" ? "คำแนะนำ" : "Recommendation"}</span><strong>{publicContext ? recommendation.label.replaceAll("_", " ") : (language === "th" ? "ยังไม่มีผลวิเคราะห์" : "NO ANALYSIS YET")}</strong><small>{publicContext ? recommendation.stationType.replaceAll("_", " ") : (language === "th" ? "เลือกรัศมี แล้วกด “วิเคราะห์พื้นที่นี้” ทางซ้าย" : "Choose a radius, then press “Analyze this area” on the left")}</small></div>

        <div className="nearby-grid">
          <div><Zap /><strong>{publicContext ? analysis.counts.evStations : "—"}</strong><span>EV stations</span></div>
          <div><Building2 /><strong>{publicContext ? analysis.counts.competitors : "—"}</strong><span>Competitors</span></div>
          <div><Fuel /><strong>{publicContext ? analysis.counts.gasStations : "—"}</strong><span>Gas stations</span></div>
          <div><MapPin /><strong>{publicContext ? analysis.counts.pois : "—"}</strong><span>POIs</span></div>
        </div>

        <section className="public-api-card" aria-labelledby="public-api-title">
          <div className="public-api-heading">
            <div><span className="api-kicker">{language === "th" ? "ข้อมูลประกอบการตัดสินใจ" : "DECISION INPUTS"}</span><strong id="public-api-title">{publicContext ? (language === "th" ? "ข้อมูลพื้นที่ที่ตรวจพบ" : "Available location data") : (language === "th" ? "สิ่งที่ระบบจะตรวจสอบ" : "What the analysis will check")}</strong></div>
            <span className={`analysis-state ${publicContext ? "ready" : "pending"}`}>{publicContext ? (language === "th" ? "พร้อม" : "Ready") : (language === "th" ? "รอวิเคราะห์" : "Pending")}</span>
          </div>
          {!publicContext && <div className="analysis-preview-list"><span><Zap />{language === "th" ? "สถานี EV คู่แข่ง ปั๊มน้ำมัน และสถานที่สำคัญ" : "EV stations, competitors, fuel stations and POIs"}</span><span><Users />{language === "th" ? "ประชากร การเข้าถึง และความต้องการโดยประมาณ" : "Population, access and estimated demand"}</span><span><Waves />{language === "th" ? "บริบทน้ำท่วม ความสูง อากาศ และการจราจร" : "Flood context, elevation, weather and traffic"}</span></div>}
          {publicContext && <>
            <div className="public-api-metrics">
              <div><MapPin /><strong>{publicCounts.evStations + publicCounts.gasStations + publicCounts.pois}</strong><span>{language === "th" ? "สถานที่รอบพื้นที่" : "Nearby places"}</span></div>
              <div><Thermometer /><strong>{publicContext.weather?.temperatureC == null ? (language === "th" ? "ไม่ทราบ" : "Unknown") : `${publicContext.weather.temperatureC}°C`}</strong><span>{language === "th" ? "อุณหภูมิ" : "Temperature"}</span></div>
              <div><Wind /><strong>{publicContext.weather?.windSpeedKmh == null ? (language === "th" ? "ไม่ทราบ" : "Unknown") : `${publicContext.weather.windSpeedKmh} km/h`}</strong><span>{language === "th" ? "ลม" : "Wind"}</span></div>
              <div><Mountain /><strong>{publicContext.elevationMeters == null ? (language === "th" ? "ไม่ทราบ" : "Unknown") : `${publicContext.elevationMeters} m`}</strong><span>{language === "th" ? "ระดับความสูง" : "Elevation"}</span></div>
              <div><Waves /><strong>{publicContext.hydrology?.maxSevenDayRiverDischargeM3s == null ? (language === "th" ? "ไม่ทราบ" : "Unknown") : `${publicContext.hydrology.maxSevenDayRiverDischargeM3s.toFixed(1)} m³/s`}</strong><span>{language === "th" ? "การไหลแม่น้ำสูงสุด 7 วัน" : "Max river flow · 7d"}</span></div>
              <div><Users /><strong>{publicContext.population?.densityPerKm2 == null ? (language === "th" ? "ไม่ทราบ" : "Unknown") : Math.round(publicContext.population.densityPerKm2).toLocaleString()}</strong><span>{language === "th" ? "ประชากร / ตร.กม." : "Population / km²"}</span></div>
              <div><Gauge /><strong>{publicContext.traffic?.currentSpeedKmh == null ? (language === "th" ? "ต้องใส่โทเคน" : "Token needed") : `${publicContext.traffic.currentSpeedKmh} km/h`}</strong><span>{language === "th" ? "ความเร็วจราจร" : "Traffic speed"}</span></div>
            </div>
            <div className="api-data-note">
              <AlertTriangle /><span>{language === "th" ? "ค่าการไหลของแม่น้ำเป็นข้อมูลแบบจำลองความละเอียดประมาณ 5 กม. ไม่ใช่ผลยืนยันความเสี่ยงน้ำท่วมของแปลงที่ดิน" : "River flow is an approximately 5 km model context, not verified parcel-level flood risk."}</span>
            </div>
            {publicContext.errors.length > 0 && <p className="api-errors">{publicContext.errors.join(" · ")}</p>}
            <small className="api-provenance">OpenStreetMap / Overpass / Photon · Open-Meteo · WorldPop · TomTom · {publicContext.cached ? "Cached response" : new Date(publicContext.fetchedAt).toLocaleString(language === "th" ? "th-TH" : "en-GB")}</small>
          </>}
        </section>

        <dl className="mini-grid result-facts">
          <div><dt>{language === "th" ? "พื้นที่" : "Area"}</dt><dd>{analysis.site.areaSqm ? `${analysis.site.areaSqm.toLocaleString()} m²` : t.survey}</dd></div>
          <div><dt>{language === "th" ? "น้ำท่วม" : "Flood risk"}</dt><dd className={`risk-${analysis.site.floodRisk.toLowerCase()}`}>{analysis.site.floodRisk}</dd></div>
          <div><dt>{language === "th" ? "คู่แข่งใกล้สุด" : "Nearest competitor"}</dt><dd>{analysis.nearestCompetitor ? `${analysis.site.nearestCompetitorKm} km` : "Unknown"}</dd></div>
          <div><dt>{language === "th" ? "ระบบไฟฟ้า" : "Power"}</dt><dd>{analysis.site.powerAvailability ?? t.survey}</dd></div>
        </dl>

        <div className="factor-mini result-factors">{Object.entries(analysis.site.factors).map(([key, value]) => <ScoreBar compact key={key} label={key.replaceAll(/([A-Z])/g, " $1")} value={value} />)}</div>

        <div className="why-box"><Sparkles /><div><strong>{language === "th" ? "เหตุผลสำคัญ" : "Why this result"}</strong><ul>{recommendation.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul></div></div>
        {(recommendation.risks.length > 0 || recommendation.missingInformation.length > 0) && <div className="risk-box"><AlertTriangle /><div><strong>{language === "th" ? "สิ่งที่ต้องตรวจสอบต่อ" : "Check before deciding"}</strong><p>{[...recommendation.risks, ...recommendation.missingInformation].slice(0, 3).join(" · ")}</p></div></div>}
        <p className="analysis-note"><CircleDot />{language === "th" ? "คำนวณใหม่อัตโนมัติเมื่อเปลี่ยนจุด รัศมี หรือขนาดพื้นที่" : "Recalculates automatically when location, radius, or area changes"}</p>
      </aside>
    </section>
  </main>;
}

"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ExpressionSpecification, GeoJSONSource, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import {
  AlertTriangle, ArrowRight, Box, Building2, CheckCircle2, ChevronDown, CircleDot, Database, Focus, Fuel,
  Gauge, Handshake, Layers3, LocateFixed, MapPin, Mountain, MousePointer2, RefreshCw, Search, Sparkles, Target, Thermometer, Users, Waves, Wind, Zap
} from "lucide-react";
import { RADIUS_OPTIONS_KM } from "@/src/config/business";
import { MAP_MARKER_STYLE, THAILAND_MAP_VIEW } from "@/src/config/geography";
import type { MapEntity } from "@/src/domain/models";
import type { PublicLocationContext } from "@/src/domain/public-api";
import { NominatimGeocodingProvider } from "@/src/providers/nominatim-geocoding.provider";
import { getPublicLocationContext } from "@/src/providers/public-location.providers";
import { getApiConnection } from "@/src/services/api-connection.service";
import { analyzeRealLocation } from "@/src/services/location-analysis.service";
import { recommendSite } from "@/src/services/recommendation-engine";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";
import { registerMapMarkerImages } from "./map-marker-icons";
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
    { id: "local-background", type: "background", paint: { "background-color": "#e5ede8" } },
    ...(tiles.enabled ? [{ id: "osm-tiles", type: "raster" as const, source: "osm", paint: { "raster-opacity": .94, "raster-fade-duration": 0 } }] : [])
  ]
  };
}

const LAYERS = [
  { id: "EV_STATION", label: "EV Stations", labelTh: "สถานีชาร์จ EV", color: "#087a5b", icon: Zap, default: true },
  { id: "COMPETITOR", label: "Competitors", labelTh: "สถานีคู่แข่ง", color: "#d84f45", icon: Building2, default: true },
  { id: "GAS_STATION", label: "Gas Stations", labelTh: "ปั๊มน้ำมัน", color: "#c68100", icon: Fuel, default: true },
  { id: "POI", label: "Points of Interest", labelTh: "สถานที่สำคัญ", color: "#3478c7", icon: MapPin, default: true },
  { id: "FLOOD", label: "Flood Risk", labelTh: "พื้นที่เสี่ยงน้ำท่วม", color: "#6658c7", icon: Waves, default: false },
  { id: "PARTNER_BRANCH", label: "Partner Branches", labelTh: "สาขาพันธมิตร", color: "#8850ad", icon: Handshake, default: false },
  { id: "OPPORTUNITY", label: "Opportunities", labelTh: "พื้นที่โอกาส", color: "#086b51", icon: Target, default: true }
] as const;

const ENTITY_ICON_BY_KIND = {
  EV_STATION: Zap,
  COMPETITOR: Building2,
  GAS_STATION: Fuel,
  POI: MapPin,
  PARTNER_BRANCH: Handshake
} as const;

type Candidate = { id: string; label: string; latitude: number; longitude: number; source: "INITIAL" | "OSM" | "MAP" };

function circlePolygon(longitude: number, latitude: number, radiusKm: number) {
  const coordinates: number[][] = [];
  const earth = 6371;
  for (let i = 0; i <= 64; i++) {
    const bearing = i * 360 / 64 * Math.PI / 180;
    const latitudeRad = latitude * Math.PI / 180;
    const longitudeRad = longitude * Math.PI / 180;
    const distance = radiusKm / earth;
    const latitude2 = Math.asin(Math.sin(latitudeRad) * Math.cos(distance) + Math.cos(latitudeRad) * Math.sin(distance) * Math.cos(bearing));
    const longitude2 = longitudeRad + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(latitudeRad), Math.cos(distance) - Math.sin(latitudeRad) * Math.sin(latitude2));
    coordinates.push([longitude2 * 180 / Math.PI, latitude2 * 180 / Math.PI]);
  }
  return { type: "Feature" as const, properties: {}, geometry: { type: "Polygon" as const, coordinates: [coordinates] } };
}

function pointFeature(longitude: number, latitude: number) {
  return { type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: [longitude, latitude] } };
}

function entityCollection(entities: MapEntity[]) {
  return {
    type: "FeatureCollection" as const,
    features: entities.map((entity) => ({
      type: "Feature" as const,
      properties: { id: entity.id, name: entity.name, kind: entity.kind, brand: entity.brand ?? "" },
      geometry: { type: "Point" as const, coordinates: [entity.longitude, entity.latitude] }
    }))
  };
}

function zoomScaledValue(value: { overview: number; normal: number; detail: number }): ExpressionSpecification {
  return [
    "interpolate", ["linear"], ["zoom"],
    MAP_MARKER_STYLE.overviewZoom, value.overview,
    MAP_MARKER_STYLE.normalZoom, value.normal,
    MAP_MARKER_STYLE.detailZoom, value.detail
  ];
}

function firstMapOverlayLayer(map: MapLibreMap) {
  return ["opportunity-clusters", "entity-clusters", "analysis-fill", "selected-point-halo"]
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
        "hillshade-shadow-color": "#29443a",
        "hillshade-highlight-color": "#f4fbf7",
        "hillshade-accent-color": "#78988c"
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
        "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, "#b8d6ca", 40, "#4d9e82", 120, "#176c53"],
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

export function MapExplorer() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [location, setLocation] = useState<Candidate>(INITIAL_LOCATION);
  const [radius, setRadius] = useState<number>(3);
  const [area, setArea] = useState<string>("");
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [tileWarning, setTileWarning] = useState(false);
  const [onlineTilesReady, setOnlineTilesReady] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const is3DRef = useRef(false);
  const [threeDStatus, setThreeDStatus] = useState<"IDLE" | "LOADING" | "READY" | "TERRAIN_ONLY" | "UNAVAILABLE">("IDLE");
  const [publicContext, setPublicContext] = useState<PublicLocationContext | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [layerState, setLayerState] = useState<Record<string, boolean>>(() => Object.fromEntries(LAYERS.map((layer) => [layer.id, layer.default])));
  const { language } = useApp();
  const languageRef = useRef(language);
  const geocoder = useMemo(() => new NominatimGeocodingProvider(), []);

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
  const visualEntities = useMemo(() => analysis.nearby.map((entity) => {
    const latitudeKm = (entity.latitude - location.latitude) * 111;
    const longitudeKm = (entity.longitude - location.longitude) * 111 * Math.cos(location.latitude * Math.PI / 180);
    const extent = Math.max(1.2, radius * 1.15);
    return {
      ...entity,
      left: Math.max(7, Math.min(93, 50 + longitudeKm / extent * 44)),
      top: Math.max(7, Math.min(93, 50 - latitudeKm / extent * 44))
    };
  }), [analysis.nearby, location.latitude, location.longitude, radius]);
  const publicCounts = useMemo(() => ({
    evStations: publicContext?.osmEntities.filter((entity) => entity.kind === "EV_STATION").length ?? 0,
    gasStations: publicContext?.osmEntities.filter((entity) => entity.kind === "GAS_STATION").length ?? 0,
    pois: publicContext?.osmEntities.filter((entity) => entity.kind === "POI").length ?? 0
  }), [publicContext]);

  const chooseLocation = (candidate: Candidate) => {
    setLocation(candidate);
    setPublicContext(null);
    setQuery("");
    setRemoteResults([]);
    setSearchMessage(languageRef.current === "th" ? "เลือกพื้นที่แล้ว — เลือกรัศมี แล้วกดวิเคราะห์พื้นที่นี้" : "Location selected — choose a radius, then analyze this area");
    mapRef.current?.easeTo({
      center: [candidate.longitude, candidate.latitude],
      zoom: is3DRef.current ? 16.5 : 13.5,
      pitch: is3DRef.current ? 65 : 0,
      bearing: is3DRef.current ? -24 : 0,
      duration: 650
    });
  };

  const changeRadius = (value: number) => {
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
      if (!map.isStyleLoaded()) return false;
      if (next) {
        let terrainEnabled = false;
        let buildingsEnabled = false;
        try { terrainEnabled = ensure3DTerrain(map); } catch (error) { console.warn("Unable to enable Mapterhorn terrain", error); }
        try { buildingsEnabled = ensure3DBuildings(map); } catch (error) { console.warn("Unable to enable OpenFreeMap buildings", error); }
        if (!terrainEnabled && !buildingsEnabled) {
          setThreeDStatus("UNAVAILABLE");
          return false;
        }
      } else {
        map.setTerrain(null);
        if (map.getLayer("terrain-hillshade")) map.setLayoutProperty("terrain-hillshade", "visibility", "none");
      }
      if (map.getLayer("3d-buildings")) map.setLayoutProperty("3d-buildings", "visibility", next ? "visible" : "none");
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
    setMapReady(true);
    const markMapReady = () => {
      if (!map.isStyleLoaded()) return;
      setMapReady(true);
      map.off("styledata", markMapReady);
    };
    map.on("styledata", markMapReady);
    markMapReady();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("error", (event) => {
      const message = String(event.error?.message ?? "").toLowerCase();
      if (message.includes("openfreemap")) setThreeDStatus(map.getTerrain()?.source ? "TERRAIN_ONLY" : "UNAVAILABLE");
      else if (message.includes("mapterhorn")) {
        const hasBuildings = map.getLayer("3d-buildings") && map.queryRenderedFeatures({ layers: ["3d-buildings"] }).length > 0;
        setThreeDStatus(hasBuildings ? "READY" : "UNAVAILABLE");
      } else if (message.includes("tile") && !is3DRef.current) setTileWarning(true);
    });
    map.on("idle", () => {
      if (map.getSource("osm") && map.isSourceLoaded("osm") && map.areTilesLoaded()) {
        setOnlineTilesReady(true);
        setTileWarning(false);
      }
      if (is3DRef.current) {
        const featureCount = map.getLayer("3d-buildings") ? map.queryRenderedFeatures({ layers: ["3d-buildings"] }).length : 0;
        const terrainConfigured = Boolean(map.getTerrain()?.source);
        setThreeDStatus(featureCount > 0 ? "READY" : terrainConfigured ? "TERRAIN_ONLY" : "UNAVAILABLE");
      }
    });
    map.on("sourcedata", (event) => {
      if (event.sourceId === "openfreemap-buildings" && event.isSourceLoaded && map.getLayer("3d-buildings")) {
        const featureCount = map.queryRenderedFeatures({ layers: ["3d-buildings"] }).length;
        setThreeDStatus(featureCount > 0 ? "READY" : map.getTerrain()?.source ? "TERRAIN_ONLY" : "UNAVAILABLE");
      }
    });
    map.on("load", () => {
      setMapReady(true);
      registerMapMarkerImages(map);
      const opportunities = {
        type: "FeatureCollection" as const,
        features: []
      };
      map.addSource("opportunities", { type: "geojson", data: opportunities, cluster: true, clusterRadius: 34, clusterMaxZoom: 11 });
      map.addLayer({ id: "opportunity-clusters", type: "symbol", source: "opportunities", filter: ["has", "point_count"], layout: { "icon-image": "marker-cluster", "icon-size": zoomScaledValue(MAP_MARKER_STYLE.clusterIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "text-field": ["get", "point_count_abbreviated"], "text-size": zoomScaledValue(MAP_MARKER_STYLE.clusterTextSize), "text-allow-overlap": true, "text-pitch-alignment": "viewport" }, paint: { "text-color": "#fff" } });
      map.addLayer({ id: "opportunity-points", type: "symbol", source: "opportunities", filter: ["!", ["has", "point_count"]], layout: { "icon-image": "marker-opportunity", "icon-size": zoomScaledValue(MAP_MARKER_STYLE.opportunityIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "icon-allow-overlap": false } });

      map.addSource("entities", { type: "geojson", data: entityCollection([]), cluster: true, clusterRadius: 28, clusterMaxZoom: 13 });
      map.addLayer({ id: "entity-clusters", type: "symbol", source: "entities", filter: ["has", "point_count"], layout: { "icon-image": "marker-cluster", "icon-size": zoomScaledValue(MAP_MARKER_STYLE.clusterIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "text-field": ["get", "point_count_abbreviated"], "text-size": zoomScaledValue(MAP_MARKER_STYLE.clusterTextSize), "text-allow-overlap": true, "text-pitch-alignment": "viewport" }, paint: { "text-color": "#fff" } });
      map.addLayer({ id: "entity-points", type: "symbol", source: "entities", filter: ["!", ["has", "point_count"]], layout: { "icon-image": ["match", ["get", "kind"], "EV_STATION", "marker-ev", "COMPETITOR", "marker-competitor", "GAS_STATION", "marker-gas", "POI", "marker-poi", "marker-partner"], "icon-size": zoomScaledValue(MAP_MARKER_STYLE.entityIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "icon-allow-overlap": false } });

      map.addSource("analysis-radius", { type: "geojson", data: circlePolygon(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude, 3) });
      map.addLayer({ id: "analysis-fill", type: "fill", source: "analysis-radius", paint: { "fill-color": "#087a5b", "fill-opacity": .11 } });
      map.addLayer({ id: "analysis-risk-fill", type: "fill", source: "analysis-radius", layout: { visibility: "none" }, paint: { "fill-color": "#7a71d8", "fill-opacity": .22 } });
      map.addLayer({ id: "analysis-line", type: "line", source: "analysis-radius", paint: { "line-color": "#087a5b", "line-width": 2.5, "line-dasharray": [2, 2] } });
      map.addSource("selected-point", { type: "geojson", data: pointFeature(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude) });
      map.addLayer({ id: "selected-point-halo", type: "circle", source: "selected-point", paint: { "circle-color": "#087a5b", "circle-radius": zoomScaledValue(MAP_MARKER_STYLE.selectedHaloRadius), "circle-opacity": .18, "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });
      map.addLayer({ id: "selected-point", type: "symbol", source: "selected-point", layout: { "icon-image": "marker-selected", "icon-size": zoomScaledValue(MAP_MARKER_STYLE.selectedIconScale), "icon-pitch-alignment": "viewport", "icon-rotation-alignment": "viewport", "icon-allow-overlap": true, "icon-ignore-placement": true } });

      map.on("click", "entity-points", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const coordinates = feature.geometry.coordinates as [number, number];
        new maplibregl.Popup({ offset: 12 }).setLngLat(coordinates).setText(`${feature.properties?.name}${feature.properties?.brand ? ` · ${feature.properties.brand}` : ""}`).addTo(map);
      });
      map.on("click", (event) => {
        const hits = map.queryRenderedFeatures(event.point, { layers: ["opportunity-points", "entity-points"] });
        if (hits.length) return;
        chooseLocation({
          id: `map-${event.lngLat.lat.toFixed(5)}-${event.lngLat.lng.toFixed(5)}`,
          label: languageRef.current === "th" ? `จุดที่เลือก ${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}` : `Selected point ${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}`,
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
          source: "MAP"
        });
      });
      map.on("mouseenter", "opportunity-points", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "opportunity-points", () => { map.getCanvas().style.cursor = "crosshair"; });
      map.getCanvas().style.cursor = "crosshair";
    });
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    (map.getSource("analysis-radius") as GeoJSONSource | undefined)?.setData(circlePolygon(location.longitude, location.latitude, radius));
    (map.getSource("selected-point") as GeoJSONSource | undefined)?.setData(pointFeature(location.longitude, location.latitude));
  }, [location, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const enabledEntityKinds = new Set(Object.entries(layerState).filter(([, enabled]) => enabled).map(([id]) => id));
    const entities = (publicContext?.osmEntities ?? []).filter((entity) => enabledEntityKinds.has(entity.kind));
    (map.getSource("entities") as GeoJSONSource | undefined)?.setData(entityCollection(entities));
    const opportunityVisibility = layerState.OPPORTUNITY ? "visible" : "none";
    ["opportunity-points", "opportunity-clusters"].forEach((id) => map.setLayoutProperty(id, "visibility", opportunityVisibility));
    map.setLayoutProperty("analysis-risk-fill", "visibility", layerState.FLOOD ? "visible" : "none");
  }, [layerState, publicContext]);

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
          <div className="layer-list">{LAYERS.map((layer) => { const enabled = layerState[layer.id]; const LayerIcon = layer.icon; return <label className={`layer-row ${enabled ? "enabled" : "disabled"}`} key={layer.id}><input type="checkbox" checked={enabled} onChange={() => setLayerState((current) => ({ ...current, [layer.id]: !current[layer.id] }))} /><span className="layer-icon" style={{ color: layer.color }}><LayerIcon aria-hidden="true" /></span><span className="layer-name">{language === "th" ? layer.labelTh : layer.label}</span><small>{enabled ? (language === "th" ? "แสดง" : "On") : (language === "th" ? "ซ่อน" : "Off")}</small></label>; })}</div>
        </section>
      </aside>

      <div className="map-canvas-wrap">
        <div ref={container} className="map-canvas" data-country={THAILAND_MAP_VIEW.countryCode} aria-label={language === "th" ? "แผนที่เลือกพื้นที่สำหรับวิเคราะห์" : "Interactive map for selecting an analysis location"} />
        <div className={`fallback-map-visual ${onlineTilesReady ? "online" : ""}`} aria-hidden="true">
          <span className="dom-place-label label-a">{analysis.site.district}</span><span className="dom-place-label label-b">{analysis.site.province}</span>
          <i className="dom-radius" style={{ width: `${Math.min(82, 24 + radius * 6)}%`, aspectRatio: "1" }} />
          <i className="dom-selected"><span /></i>
          {visualEntities.map((entity) => { const EntityIcon = ENTITY_ICON_BY_KIND[entity.kind]; return <span key={entity.id} title={entity.name} className={`dom-entity entity-${entity.kind.toLowerCase()}`} style={{ left: `${entity.left}%`, top: `${entity.top}%` }}><EntityIcon /></span>; })}
        </div>
        <div className="map-instruction"><MousePointer2 />{language === "th" ? "คลิกจุดที่สนใจบนแผนที่" : "Click a point to analyze it"}</div>
        <div className="map-country-badge"><MapPin />{language === "th" ? "ขอบเขตประเทศไทย" : "Thailand coverage"}</div>
        <div className={`map-symbol-legend ${legendOpen ? "open" : "collapsed"}`} aria-label={language === "th" ? "คำอธิบายสัญลักษณ์บนแผนที่" : "Map symbol legend"}>
          <button className="legend-toggle" type="button" onClick={() => setLegendOpen((current) => !current)} aria-expanded={legendOpen}>
            <Layers3 /><span>{language === "th" ? "สัญลักษณ์" : "Symbols"}</span><small>{Object.values(layerState).filter(Boolean).length}/{LAYERS.length}</small><ChevronDown aria-hidden="true" />
          </button>
          {legendOpen && <div className="legend-items">{LAYERS.map((layer) => { const enabled = layerState[layer.id]; const LayerIcon = layer.icon; return <span className={`map-symbol-item ${enabled ? "enabled" : "disabled"}`} key={layer.id}><i style={{ color: layer.color }}><LayerIcon aria-hidden="true" /></i>{language === "th" ? layer.labelTh : layer.label}</span>; })}</div>}
        </div>
        {tileWarning && <div className="tile-warning"><AlertTriangle />{language === "th" ? "แผนที่ถนนออนไลน์ไม่พร้อม — ยังเลือกจุดบนแผนที่สาธิตได้" : "Online road tiles unavailable — demo map selection still works"}</div>}
        <button className={`map-float-btn map-3d-btn ${is3D ? "active" : ""}`} onClick={toggle3D} aria-pressed={is3D} disabled={!mapReady} title="MapLibre + Mapterhorn terrain + OpenFreeMap buildings"><Box />{is3D ? "2D" : mapReady ? "3D" : "Map…"}</button>
        {is3D && <div className={`map-3d-status status-${threeDStatus.toLowerCase()}`} data-3d-status={threeDStatus}><Box />{
          threeDStatus === "READY" ? (language === "th" ? "ภูมิประเทศและอาคาร 3D พร้อม" : "3D terrain and buildings ready")
            : threeDStatus === "TERRAIN_ONLY" ? (language === "th" ? "ภูมิประเทศ 3D พร้อม · ไม่พบข้อมูลความสูงอาคารบริเวณนี้" : "3D terrain ready · no building-height data in this view")
              : threeDStatus === "LOADING" ? (language === "th" ? "กำลังโหลดภูมิประเทศและอาคาร 3D…" : "Loading 3D terrain and buildings…")
                : (language === "th" ? "ผู้ให้บริการข้อมูล 3D ไม่พร้อม" : "3D providers unavailable")
        }</div>}
        <button className="map-float-btn" disabled={!mapReady} onClick={() => mapRef.current?.easeTo({ center: [location.longitude, location.latitude], zoom: is3D ? 16.5 : 13.5, pitch: is3D ? 65 : 0, bearing: is3D ? -24 : 0, duration: 500 })}><Focus />{language === "th" ? "กลับไปจุดที่เลือก" : "Center selected point"}</button>
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
            <small className="api-provenance">OpenStreetMap / Overpass · Open-Meteo · WorldPop · TomTom · {publicContext.cached ? "Cached response" : new Date(publicContext.fetchedAt).toLocaleString(language === "th" ? "th-TH" : "en-GB")}</small>
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

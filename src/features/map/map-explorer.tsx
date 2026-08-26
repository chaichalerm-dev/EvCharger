"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import {
  AlertTriangle, Box, Building2, CheckCircle2, CircleDot, CloudDownload, Database, Focus, Fuel,
  Layers3, LocateFixed, MapPin, Mountain, MousePointer2, Search, Sparkles, Thermometer, Waves, Wind, Zap
} from "lucide-react";
import { RADIUS_OPTIONS_KM } from "@/src/config/business";
import { MAP_MARKER_STYLE, THAILAND_MAP_VIEW } from "@/src/config/geography";
import { SEARCH_LOCATIONS, type SearchLocation } from "@/src/data/mock/search-locations";
import type { MapEntity } from "@/src/domain/models";
import type { PublicLocationContext } from "@/src/domain/public-api";
import { NominatimGeocodingProvider } from "@/src/providers/nominatim-geocoding.provider";
import { getPublicLocationContext } from "@/src/providers/public-location.providers";
import { catalogService } from "@/src/services/catalog.service";
import { analyzeLocation } from "@/src/services/location-analysis.service";
import { recommendSite } from "@/src/services/recommendation-engine";
import { calculateSiteScore } from "@/src/services/scoring-engine";
import { useApp } from "@/src/store/app-context";

const MOCK_SITES = catalogService.getSites();
const MOCK_MAP_ENTITIES = catalogService.getMapEntities();
const INITIAL_LOCATION = SEARCH_LOCATIONS.find((item) => item.id === "loc-bangna")!;

const BASE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [
    { id: "local-background", type: "background", paint: { "background-color": "#e5ede8" } },
    { id: "osm-tiles", type: "raster", source: "osm", paint: { "raster-opacity": .94, "raster-fade-duration": 0 } }
  ]
};

const LAYERS = [
  { id: "EV_STATION", label: "EV Stations", labelTh: "สถานีชาร์จ EV", color: "#19a974", default: true },
  { id: "COMPETITOR", label: "Competitors", labelTh: "คู่แข่ง", color: "#ef6b59", default: true },
  { id: "GAS_STATION", label: "Gas Stations", labelTh: "ปั๊มน้ำมัน", color: "#e5a21a", default: true },
  { id: "POI", label: "Points of Interest", labelTh: "สถานที่สำคัญ", color: "#4b86d8", default: true },
  { id: "FLOOD", label: "Flood Risk", labelTh: "ความเสี่ยงน้ำท่วม", color: "#7a71d8", default: false },
  { id: "PARTNER_BRANCH", label: "Partner Branches", labelTh: "สาขาพันธมิตร", color: "#9b62c4", default: false },
  { id: "OPPORTUNITY", label: "Opportunities", labelTh: "พื้นที่โอกาส", color: "#087a5b", default: true }
] as const;

type Candidate = Pick<SearchLocation, "id" | "label" | "latitude" | "longitude" | "referenceSiteId"> & { source: "LOCAL" | "OSM" };

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

function ensure3DBuildings(map: MapLibreMap) {
  if (!map.getSource("openfreemap-buildings")) {
    map.addSource("openfreemap-buildings", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
  }
  const firstOverlayLayer = ["opportunity-clusters", "entity-clusters", "analysis-fill", "selected-point-halo"]
    .find((layerId) => map.getLayer(layerId));
  if (!map.getLayer("3d-buildings")) {
    map.addLayer({
      id: "3d-buildings",
      type: "fill-extrusion",
      source: "openfreemap-buildings",
      "source-layer": "building",
      minzoom: 15,
      layout: { visibility: "none" },
      filter: ["!=", ["get", "hide_3d"], true],
      paint: {
        "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 0], 0, "#d7dfdb", 80, "#7fb8a5", 200, "#4a8f78"],
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, ["coalesce", ["get", "render_height"], 8]],
        "fill-extrusion-base": ["case", [">=", ["get", "zoom"], 16], ["coalesce", ["get", "render_min_height"], 0], 0],
        "fill-extrusion-opacity": 0.9,
        "fill-extrusion-vertical-gradient": true
      }
    }, firstOverlayLayer);
  } else if (firstOverlayLayer) {
    map.moveLayer("3d-buildings", firstOverlayLayer);
  }
}

export function MapExplorer() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [location, setLocation] = useState<Candidate>({ ...INITIAL_LOCATION, source: "LOCAL" });
  const [radius, setRadius] = useState<number>(3);
  const [area, setArea] = useState<string>("");
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [pinMode, setPinMode] = useState(false);
  const [tileWarning, setTileWarning] = useState(false);
  const [onlineTilesReady, setOnlineTilesReady] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const is3DRef = useRef(false);
  const [threeDStatus, setThreeDStatus] = useState<"IDLE" | "LOADING" | "READY" | "NO_BUILDINGS" | "UNAVAILABLE">("IDLE");
  const [publicContext, setPublicContext] = useState<PublicLocationContext | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [layerState, setLayerState] = useState<Record<string, boolean>>(() => Object.fromEntries(LAYERS.map((layer) => [layer.id, layer.default])));
  const { language } = useApp();
  const languageRef = useRef(language);
  const geocoder = useMemo(() => new NominatimGeocodingProvider(), []);

  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => {
    const timer = window.setTimeout(() => setInteractive(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const localResults = useMemo<Candidate[]>(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    return SEARCH_LOCATIONS
      .filter((item) => `${item.label} ${item.labelTh} ${item.province} ${item.district}`.toLocaleLowerCase().includes(normalized))
      .slice(0, 6)
      .map((item) => ({ ...item, label: language === "th" ? item.labelTh : item.label, source: "LOCAL" }));
  }, [language, query]);
  const displayedResults = remoteResults.length ? [...localResults, ...remoteResults].slice(0, 8) : localResults;

  const analysis = useMemo(() => analyzeLocation({
    label: location.label,
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm: radius,
    areaSqm: area ? Number(area) : undefined,
    referenceSiteId: location.referenceSiteId
  }), [area, location, radius]);
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
    setSearchMessage(languageRef.current === "th" ? "เลือกพื้นที่แล้ว — ผลวิเคราะห์อัปเดตทันที" : "Location selected — analysis updated");
    setPinMode(false);
    mapRef.current?.easeTo({
      center: [candidate.longitude, candidate.latitude],
      zoom: is3DRef.current ? 16.2 : 13.5,
      pitch: is3DRef.current ? 60 : 0,
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
      try {
        if (next) ensure3DBuildings(map);
      } catch (error) {
        console.warn("Unable to enable the OpenFreeMap 3D building layer", error);
        setThreeDStatus("UNAVAILABLE");
        return false;
      }
      if (map.getLayer("3d-buildings")) map.setLayoutProperty("3d-buildings", "visibility", next ? "visible" : "none");
      map.easeTo({
        pitch: next ? 60 : 0,
        bearing: next ? -24 : 0,
        zoom: next ? Math.max(map.getZoom(), 16.2) : Math.min(map.getZoom(), 14),
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
    setRemoteResults(results.map((result, index) => ({ id: `osm-${index}`, ...result, source: "OSM" })));
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
      style: BASE_STYLE,
      center: [INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude],
      zoom: 12.2,
      minZoom: THAILAND_MAP_VIEW.minZoom,
      maxZoom: THAILAND_MAP_VIEW.maxZoom,
      maxBounds: THAILAND_MAP_VIEW.bounds,
      renderWorldCopies: THAILAND_MAP_VIEW.renderWorldCopies,
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
      if (message.includes("openfreemap")) setThreeDStatus("UNAVAILABLE");
      else if (message.includes("tile")) setTileWarning(true);
    });
    map.on("idle", () => {
      if (map.isSourceLoaded("osm") && map.areTilesLoaded()) {
        setOnlineTilesReady(true);
        setTileWarning(false);
      }
      if (is3DRef.current && map.getLayer("3d-buildings") && map.isSourceLoaded("openfreemap-buildings")) {
        const featureCount = map.queryRenderedFeatures({ layers: ["3d-buildings"] }).length;
        setThreeDStatus(featureCount > 0 ? "READY" : "NO_BUILDINGS");
      }
    });
    map.on("sourcedata", (event) => {
      if (event.sourceId === "openfreemap-buildings" && event.isSourceLoaded && map.getLayer("3d-buildings")) {
        const featureCount = map.queryRenderedFeatures({ layers: ["3d-buildings"] }).length;
        setThreeDStatus(featureCount > 0 ? "READY" : "NO_BUILDINGS");
      }
    });
    map.on("load", () => {
      setMapReady(true);
      const opportunities = {
        type: "FeatureCollection" as const,
        features: MOCK_SITES.map((site) => ({
          type: "Feature" as const,
          properties: { id: site.id, name: site.name, score: calculateSiteScore(site.factors).overall },
          geometry: { type: "Point" as const, coordinates: [site.longitude, site.latitude] }
        }))
      };
      map.addSource("opportunities", { type: "geojson", data: opportunities, cluster: true, clusterRadius: 34, clusterMaxZoom: 11 });
      map.addLayer({ id: "opportunity-clusters", type: "circle", source: "opportunities", filter: ["has", "point_count"], paint: { "circle-color": "#087a5b", "circle-radius": MAP_MARKER_STYLE.opportunityClusterRadius, "circle-stroke-width": 2, "circle-stroke-color": "#fff", "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });
      map.addLayer({ id: "opportunity-cluster-count", type: "symbol", source: "opportunities", filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 9, "text-pitch-alignment": "viewport" }, paint: { "text-color": "#fff" } });
      map.addLayer({ id: "opportunity-points", type: "circle", source: "opportunities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": "#087a5b", "circle-radius": MAP_MARKER_STYLE.opportunityPointRadius, "circle-stroke-width": 2, "circle-stroke-color": "#fff", "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });

      map.addSource("entities", { type: "geojson", data: entityCollection(MOCK_MAP_ENTITIES), cluster: true, clusterRadius: 28, clusterMaxZoom: 13 });
      map.addLayer({ id: "entity-clusters", type: "circle", source: "entities", filter: ["has", "point_count"], paint: { "circle-color": "#526b62", "circle-radius": MAP_MARKER_STYLE.entityClusterRadius, "circle-stroke-width": 1.5, "circle-stroke-color": "#fff", "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });
      map.addLayer({ id: "entity-points", type: "circle", source: "entities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["match", ["get", "kind"], "EV_STATION", "#19a974", "COMPETITOR", "#ef6b59", "GAS_STATION", "#e5a21a", "POI", "#4b86d8", "#9b62c4"], "circle-radius": MAP_MARKER_STYLE.entityPointRadius, "circle-stroke-width": 1.5, "circle-stroke-color": "#fff", "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });

      map.addSource("analysis-radius", { type: "geojson", data: circlePolygon(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude, 3) });
      map.addLayer({ id: "analysis-fill", type: "fill", source: "analysis-radius", paint: { "fill-color": "#087a5b", "fill-opacity": .11 } });
      map.addLayer({ id: "analysis-risk-fill", type: "fill", source: "analysis-radius", layout: { visibility: "none" }, paint: { "fill-color": "#7a71d8", "fill-opacity": .22 } });
      map.addLayer({ id: "analysis-line", type: "line", source: "analysis-radius", paint: { "line-color": "#087a5b", "line-width": 2.5, "line-dasharray": [2, 2] } });
      map.addSource("selected-point", { type: "geojson", data: pointFeature(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude) });
      map.addLayer({ id: "selected-point-halo", type: "circle", source: "selected-point", paint: { "circle-color": "#087a5b", "circle-radius": MAP_MARKER_STYLE.selectedHaloRadius, "circle-opacity": .18, "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });
      map.addLayer({ id: "selected-point", type: "circle", source: "selected-point", paint: { "circle-color": "#087a5b", "circle-radius": MAP_MARKER_STYLE.selectedPointRadius, "circle-stroke-width": 3, "circle-stroke-color": "#fff", "circle-pitch-alignment": MAP_MARKER_STYLE.pitchAlignment, "circle-pitch-scale": MAP_MARKER_STYLE.pitchScale } });

      map.on("click", "opportunity-points", (event) => {
        const id = event.features?.[0]?.properties?.id;
        const place = SEARCH_LOCATIONS.find((item) => item.referenceSiteId === id);
        if (place) chooseLocation({ ...place, label: languageRef.current === "th" ? place.labelTh : place.label, source: "LOCAL" });
      });
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
          source: "LOCAL"
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
    const entities = [...MOCK_MAP_ENTITIES, ...(publicContext?.osmEntities ?? [])].filter((entity) => enabledEntityKinds.has(entity.kind));
    (map.getSource("entities") as GeoJSONSource | undefined)?.setData(entityCollection(entities));
    const opportunityVisibility = layerState.OPPORTUNITY ? "visible" : "none";
    ["opportunity-points", "opportunity-clusters", "opportunity-cluster-count"].forEach((id) => map.setLayoutProperty(id, "visibility", opportunityVisibility));
    map.setLayoutProperty("analysis-risk-fill", "visibility", layerState.FLOOD ? "visible" : "none");
  }, [layerState, publicContext]);

  const t = {
    title: language === "th" ? "ค้นหาและวิเคราะห์พื้นที่" : "Find & analyze a location",
    subtitle: language === "th" ? "ค้นหาชื่อสถานที่ หรือคลิกจุดใดก็ได้บนแผนที่" : "Search a place or click anywhere on the map",
    searchPlaceholder: language === "th" ? "เช่น บางนา, อโศก, ศรีราชา หรือชื่อสถานที่" : "Try Bang Na, Asok, Si Racha or an address",
    analyze: language === "th" ? "ค้นหา" : "Search",
    area: language === "th" ? "พื้นที่ว่าง (ตร.ม.) — ไม่บังคับ" : "Available area (m²) — optional",
    result: language === "th" ? "ผลวิเคราะห์พื้นที่" : "Location analysis",
    estimated: language === "th" ? "ค่าประเมิน" : "Estimated",
    survey: language === "th" ? "ต้องสำรวจพื้นที่จริง" : "Requires site survey"
  };

  return <main className="map-page simple-map-page">
    <section className="map-toolbar simple-map-toolbar">
      <div className="map-title"><span className="eyebrow">EV expansion workspace</span><h1>{t.title}</h1><p>{t.subtitle}</p></div>
      <form className="map-search-form" onSubmit={searchPlaces}>
        <div className="map-search">
          <Search />
          <input disabled={!interactive} value={query} onChange={(event) => { setQuery(event.target.value); setRemoteResults([]); setSearchMessage(""); }} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} />
          {query && <div className="search-results">
            {displayedResults.map((candidate) => <button type="button" key={`${candidate.source}-${candidate.id}`} onClick={() => chooseLocation(candidate)}>
              <MapPin /><span><strong>{candidate.label}</strong><small>{candidate.source === "OSM" ? "OpenStreetMap search" : language === "th" ? "ข้อมูลค้นหาสาธิต" : "Demo search index"}</small></span>
            </button>)}
            {!displayedResults.length && !searching && <p>{language === "th" ? "กด “ค้นหา” เพื่อค้นหาชื่อสถานที่ในประเทศไทย" : "Press Search to look up places in Thailand"}</p>}
          </div>}
        </div>
        <button className="btn primary search-submit" type="submit" disabled={!interactive || searching}>{searching ? "…" : t.analyze}</button>
      </form>
      <label className="area-input"><span>{t.area}</span><input inputMode="numeric" min="1" max="1000000" type="number" value={area} onChange={(event) => setArea(event.target.value)} placeholder="e.g. 600" /></label>
    </section>

    <div className="map-disclaimer"><Database />{language === "th" ? "Demo / Mock Data — คะแนนเป็นค่าประเมินเพื่อสาธิต ไม่ใช่ข้อมูลเรียลไทม์" : "Demo / Mock Data — scores are estimates for demonstration, not real-time data"}</div>
    {searchMessage && <div className="map-status"><CheckCircle2 />{searchMessage}</div>}

    <section className="map-workspace simple-map-workspace">
      <aside className="map-panel analysis-controls">
        <div className="step-label"><span>1</span>{language === "th" ? "เลือกพื้นที่" : "Choose a location"}</div>
        <button className={`drop-pin-card ${pinMode ? "active" : ""}`} onClick={() => setPinMode((value) => !value)}>
          <MousePointer2 /><span><strong>{language === "th" ? "คลิกบนแผนที่" : "Click the map"}</strong><small>{language === "th" ? "เลือกจุดและคำนวณทันที" : "Select a point and calculate instantly"}</small></span>
        </button>
        <div className="selected-coordinate"><LocateFixed /><span><strong>{location.label}</strong><small>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</small></span></div>

        <div className="panel-divider" />
        <div className="step-label"><span>2</span>{language === "th" ? "เลือกรัศมีวิเคราะห์" : "Choose analysis radius"}</div>
        <div className="radius-options large">{RADIUS_OPTIONS_KM.map((value) => <button className={radius === value ? "active" : ""} onClick={() => changeRadius(value)} key={value}>{value} km</button>)}</div>

        <details className="layer-details">
          <summary><Layers3 />{language === "th" ? "ชั้นข้อมูลบนแผนที่" : "Map layers"}<span>{Object.values(layerState).filter(Boolean).length}</span></summary>
          {LAYERS.map((layer) => <label className="layer-row" key={layer.id}><input type="checkbox" checked={layerState[layer.id]} onChange={() => setLayerState((current) => ({ ...current, [layer.id]: !current[layer.id] }))} /><span className="layer-swatch" style={{ background: layer.color }} /><span>{language === "th" ? layer.labelTh : layer.label}</span></label>)}
        </details>
      </aside>

      <div className="map-canvas-wrap">
        <div ref={container} className="map-canvas" data-country={THAILAND_MAP_VIEW.countryCode} aria-label={language === "th" ? "แผนที่เลือกพื้นที่สำหรับวิเคราะห์" : "Interactive map for selecting an analysis location"} />
        <div className={`fallback-map-visual ${onlineTilesReady ? "online" : ""}`} aria-hidden="true">
          <span className="dom-place-label label-a">{analysis.site.district}</span><span className="dom-place-label label-b">{analysis.site.province}</span>
          <i className="dom-radius" style={{ width: `${Math.min(82, 24 + radius * 6)}%`, aspectRatio: "1" }} />
          <i className="dom-selected"><span /></i>
          {visualEntities.map((entity) => <i key={entity.id} title={entity.name} className={`dom-entity entity-${entity.kind.toLowerCase()}`} style={{ left: `${entity.left}%`, top: `${entity.top}%` }} />)}
        </div>
        <div className="map-instruction"><MousePointer2 />{language === "th" ? "คลิกจุดที่สนใจบนแผนที่" : "Click a point to analyze it"}</div>
        <div className="map-country-badge"><MapPin />{language === "th" ? "ขอบเขตประเทศไทย" : "Thailand coverage"}</div>
        {tileWarning && <div className="tile-warning"><AlertTriangle />{language === "th" ? "แผนที่ถนนออนไลน์ไม่พร้อม — ยังเลือกจุดบนแผนที่สาธิตได้" : "Online road tiles unavailable — demo map selection still works"}</div>}
        <button className={`map-float-btn map-3d-btn ${is3D ? "active" : ""}`} onClick={toggle3D} aria-pressed={is3D} disabled={!mapReady} title="MapLibre + OpenFreeMap 3D buildings"><Box />{is3D ? "2D" : mapReady ? "3D" : "Map…"}</button>
        {is3D && <div className={`map-3d-status status-${threeDStatus.toLowerCase()}`}><Box />{threeDStatus === "READY" ? (language === "th" ? "อาคาร 3D พร้อมใช้งาน" : "3D buildings ready") : threeDStatus === "NO_BUILDINGS" ? (language === "th" ? "ไม่พบอาคาร 3D บริเวณนี้" : "No 3D buildings in view") : `OpenFreeMap 3D · ${threeDStatus}`}</div>}
        <button className="map-float-btn" disabled={!mapReady} onClick={() => mapRef.current?.easeTo({ center: [location.longitude, location.latitude], zoom: is3D ? 16.2 : 13.5, pitch: is3D ? 60 : 0, bearing: is3D ? -24 : 0, duration: 500 })}><Focus />{language === "th" ? "กลับไปจุดที่เลือก" : "Center selected point"}</button>
      </div>

      <aside className="map-panel site-panel result-panel">
        <div className="result-heading"><div><span className="step-label compact"><span>3</span>{t.result}</span><small>{analysis.estimated ? t.estimated : analysis.site.provenance.verifiedStatus}</small></div><div className="score-block"><strong>{score.overall}</strong><span>/100</span></div></div>
        <h2>{analysis.site.name}</h2>
        <p>{radius} km radius · {analysis.site.province} · {analysis.site.district}</p>
        <div className={`recommendation-strip ${recommendation.overridden ? "warning" : ""}`}><span>{language === "th" ? "คำแนะนำ" : "Recommendation"}</span><strong>{recommendation.label.replaceAll("_", " ")}</strong><small>{recommendation.stationType.replaceAll("_", " ")}</small></div>

        <div className="nearby-grid">
          <div><Zap /><strong>{analysis.counts.evStations}</strong><span>EV stations</span></div>
          <div><Building2 /><strong>{analysis.counts.competitors}</strong><span>Competitors</span></div>
          <div><Fuel /><strong>{analysis.counts.gasStations}</strong><span>Gas stations</span></div>
          <div><MapPin /><strong>{analysis.counts.pois}</strong><span>POIs</span></div>
        </div>

        <section className="public-api-card" aria-labelledby="public-api-title">
          <div className="public-api-heading">
            <div><span className="api-kicker">FREE PUBLIC DATA</span><strong id="public-api-title">{language === "th" ? "ตรวจข้อมูลพื้นที่จาก API" : "Check public location APIs"}</strong></div>
            <button className="btn api-fetch-btn" type="button" onClick={loadPublicData} disabled={publicLoading}>
              <CloudDownload />{publicLoading ? (language === "th" ? "กำลังตรวจ…" : "Checking…") : (language === "th" ? "ตรวจพื้นที่นี้" : "Check this area")}
            </button>
          </div>
          {!publicContext && <p>{language === "th" ? "กดเมื่อต้องการดึง POI, อากาศ, ระดับความสูง และบริบทการไหลของแม่น้ำสำหรับพิกัดนี้" : "Fetch POIs, weather, elevation, and river-flow context for this coordinate on demand."}</p>}
          {publicContext && <>
            <div className="public-api-metrics">
              <div><MapPin /><strong>{publicCounts.evStations + publicCounts.gasStations + publicCounts.pois}</strong><span>OSM places</span></div>
              <div><Thermometer /><strong>{publicContext.weather?.temperatureC == null ? "Unknown" : `${publicContext.weather.temperatureC}°C`}</strong><span>Temperature</span></div>
              <div><Wind /><strong>{publicContext.weather?.windSpeedKmh == null ? "Unknown" : `${publicContext.weather.windSpeedKmh} km/h`}</strong><span>Wind</span></div>
              <div><Mountain /><strong>{publicContext.elevationMeters == null ? "Unknown" : `${publicContext.elevationMeters} m`}</strong><span>Elevation</span></div>
              <div><Waves /><strong>{publicContext.hydrology?.maxSevenDayRiverDischargeM3s == null ? "Unknown" : `${publicContext.hydrology.maxSevenDayRiverDischargeM3s.toFixed(1)} m³/s`}</strong><span>Max river flow · 7d</span></div>
            </div>
            <div className="api-data-note">
              <AlertTriangle /><span>{language === "th" ? "ค่าการไหลของแม่น้ำเป็นข้อมูลแบบจำลองความละเอียดประมาณ 5 กม. ไม่ใช่ผลยืนยันความเสี่ยงน้ำท่วมของแปลงที่ดิน" : "River flow is an approximately 5 km model context, not verified parcel-level flood risk."}</span>
            </div>
            {publicContext.errors.length > 0 && <p className="api-errors">{publicContext.errors.join(" · ")}</p>}
            <small className="api-provenance">OpenStreetMap / Overpass · Open-Meteo · {publicContext.cached ? "Cached response" : new Date(publicContext.fetchedAt).toLocaleString(language === "th" ? "th-TH" : "en-GB")}</small>
          </>}
        </section>

        <dl className="mini-grid result-facts">
          <div><dt>{language === "th" ? "พื้นที่" : "Area"}</dt><dd>{analysis.site.areaSqm ? `${analysis.site.areaSqm.toLocaleString()} m²` : t.survey}</dd></div>
          <div><dt>{language === "th" ? "น้ำท่วม" : "Flood risk"}</dt><dd className={`risk-${analysis.site.floodRisk.toLowerCase()}`}>{analysis.site.floodRisk}</dd></div>
          <div><dt>{language === "th" ? "คู่แข่งใกล้สุด" : "Nearest competitor"}</dt><dd>{analysis.nearestCompetitor ? `${analysis.site.nearestCompetitorKm} km` : "Unknown"}</dd></div>
          <div><dt>{language === "th" ? "ระบบไฟฟ้า" : "Power"}</dt><dd>{analysis.site.powerAvailability ?? t.survey}</dd></div>
        </dl>

        <div className="factor-mini result-factors">{Object.entries(analysis.site.factors).map(([key, value]) => <div key={key}><span>{key.replaceAll(/([A-Z])/g, " $1")}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>)}</div>

        <div className="why-box"><Sparkles /><div><strong>{language === "th" ? "เหตุผลสำคัญ" : "Why this result"}</strong><ul>{recommendation.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul></div></div>
        {(recommendation.risks.length > 0 || recommendation.missingInformation.length > 0) && <div className="risk-box"><AlertTriangle /><div><strong>{language === "th" ? "สิ่งที่ต้องตรวจสอบต่อ" : "Check before deciding"}</strong><p>{[...recommendation.risks, ...recommendation.missingInformation].slice(0, 3).join(" · ")}</p></div></div>}
        <p className="analysis-note"><CircleDot />{language === "th" ? "คำนวณใหม่อัตโนมัติเมื่อเปลี่ยนจุด รัศมี หรือขนาดพื้นที่" : "Recalculates automatically when location, radius, or area changes"}</p>
      </aside>
    </section>
  </main>;
}

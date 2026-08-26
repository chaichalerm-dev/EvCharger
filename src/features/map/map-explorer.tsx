"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import {
  AlertTriangle, Building2, CheckCircle2, CircleDot, Database, Focus, Fuel,
  Layers3, LocateFixed, MapPin, MousePointer2, Search, Sparkles, Zap
} from "lucide-react";
import { RADIUS_OPTIONS_KM } from "@/src/config/business";
import { SEARCH_LOCATIONS, type SearchLocation } from "@/src/data/mock/search-locations";
import type { MapEntity } from "@/src/domain/models";
import { NominatimGeocodingProvider } from "@/src/providers/nominatim-geocoding.provider";
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

function demoRoads(longitude: number, latitude: number) {
  const spread = .035;
  const features = [
    [[longitude - spread, latitude - .012], [longitude + spread, latitude + .014]],
    [[longitude - spread, latitude + .016], [longitude + spread, latitude - .018]],
    [[longitude - .018, latitude - spread], [longitude + .012, latitude + spread]],
    [[longitude + .025, latitude - spread], [longitude + .020, latitude + spread]],
    [[longitude - spread, latitude + .001], [longitude + spread, latitude + .001]]
  ].map((coordinates, index) => ({
    type: "Feature" as const,
    properties: { width: index < 2 ? 4 : 2 },
    geometry: { type: "LineString" as const, coordinates }
  }));
  return { type: "FeatureCollection" as const, features };
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
  const [layerState, setLayerState] = useState<Record<string, boolean>>(() => Object.fromEntries(LAYERS.map((layer) => [layer.id, layer.default])));
  const { language } = useApp();
  const languageRef = useRef(language);
  const geocoder = useMemo(() => new NominatimGeocodingProvider(), []);

  useEffect(() => { languageRef.current = language; }, [language]);

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

  const chooseLocation = (candidate: Candidate) => {
    setLocation(candidate);
    setQuery("");
    setRemoteResults([]);
    setSearchMessage(languageRef.current === "th" ? "เลือกพื้นที่แล้ว — ผลวิเคราะห์อัปเดตทันที" : "Location selected — analysis updated");
    setPinMode(false);
    mapRef.current?.easeTo({ center: [candidate.longitude, candidate.latitude], zoom: 13.5, duration: 650 });
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
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: BASE_STYLE,
      center: [INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude],
      zoom: 12.2,
      attributionControl: false
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("error", (event) => {
      if (String(event.error?.message ?? "").toLowerCase().includes("tile")) setTileWarning(true);
    });
    map.on("load", () => {
      map.addSource("demo-roads", { type: "geojson", data: demoRoads(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude) });
      map.addLayer({ id: "demo-road-casing", type: "line", source: "demo-roads", paint: { "line-color": "#c5d2cc", "line-width": ["+", ["get", "width"], 5], "line-opacity": .72 } });
      map.addLayer({ id: "demo-roads", type: "line", source: "demo-roads", paint: { "line-color": "#ffffff", "line-width": ["+", ["get", "width"], 2], "line-opacity": .9 } });

      const opportunities = {
        type: "FeatureCollection" as const,
        features: MOCK_SITES.map((site) => ({
          type: "Feature" as const,
          properties: { id: site.id, name: site.name, score: calculateSiteScore(site.factors).overall },
          geometry: { type: "Point" as const, coordinates: [site.longitude, site.latitude] }
        }))
      };
      map.addSource("opportunities", { type: "geojson", data: opportunities, cluster: true, clusterRadius: 40, clusterMaxZoom: 11 });
      map.addLayer({ id: "opportunity-clusters", type: "circle", source: "opportunities", filter: ["has", "point_count"], paint: { "circle-color": "#087a5b", "circle-radius": ["step", ["get", "point_count"], 16, 6, 21], "circle-stroke-width": 3, "circle-stroke-color": "#fff" } });
      map.addLayer({ id: "opportunity-cluster-count", type: "symbol", source: "opportunities", filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 11 }, paint: { "text-color": "#fff" } });
      map.addLayer({ id: "opportunity-points", type: "circle", source: "opportunities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": "#087a5b", "circle-radius": 8, "circle-stroke-width": 3, "circle-stroke-color": "#fff" } });

      map.addSource("entities", { type: "geojson", data: entityCollection(MOCK_MAP_ENTITIES), cluster: true, clusterRadius: 34, clusterMaxZoom: 13 });
      map.addLayer({ id: "entity-clusters", type: "circle", source: "entities", filter: ["has", "point_count"], paint: { "circle-color": "#526b62", "circle-radius": 14, "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
      map.addLayer({ id: "entity-points", type: "circle", source: "entities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["match", ["get", "kind"], "EV_STATION", "#19a974", "COMPETITOR", "#ef6b59", "GAS_STATION", "#e5a21a", "POI", "#4b86d8", "#9b62c4"], "circle-radius": 7, "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });

      map.addSource("analysis-radius", { type: "geojson", data: circlePolygon(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude, 3) });
      map.addLayer({ id: "analysis-fill", type: "fill", source: "analysis-radius", paint: { "fill-color": "#087a5b", "fill-opacity": .11 } });
      map.addLayer({ id: "analysis-risk-fill", type: "fill", source: "analysis-radius", layout: { visibility: "none" }, paint: { "fill-color": "#7a71d8", "fill-opacity": .22 } });
      map.addLayer({ id: "analysis-line", type: "line", source: "analysis-radius", paint: { "line-color": "#087a5b", "line-width": 2.5, "line-dasharray": [2, 2] } });
      map.addSource("selected-point", { type: "geojson", data: pointFeature(INITIAL_LOCATION.longitude, INITIAL_LOCATION.latitude) });
      map.addLayer({ id: "selected-point-halo", type: "circle", source: "selected-point", paint: { "circle-color": "#087a5b", "circle-radius": 17, "circle-opacity": .18 } });
      map.addLayer({ id: "selected-point", type: "circle", source: "selected-point", paint: { "circle-color": "#087a5b", "circle-radius": 9, "circle-stroke-width": 4, "circle-stroke-color": "#fff" } });

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
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    (map.getSource("analysis-radius") as GeoJSONSource | undefined)?.setData(circlePolygon(location.longitude, location.latitude, radius));
    (map.getSource("selected-point") as GeoJSONSource | undefined)?.setData(pointFeature(location.longitude, location.latitude));
    (map.getSource("demo-roads") as GeoJSONSource | undefined)?.setData(demoRoads(location.longitude, location.latitude));
  }, [location, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const enabledEntityKinds = new Set(Object.entries(layerState).filter(([, enabled]) => enabled).map(([id]) => id));
    const entities = MOCK_MAP_ENTITIES.filter((entity) => enabledEntityKinds.has(entity.kind));
    (map.getSource("entities") as GeoJSONSource | undefined)?.setData(entityCollection(entities));
    const opportunityVisibility = layerState.OPPORTUNITY ? "visible" : "none";
    ["opportunity-points", "opportunity-clusters", "opportunity-cluster-count"].forEach((id) => map.setLayoutProperty(id, "visibility", opportunityVisibility));
    map.setLayoutProperty("analysis-risk-fill", "visibility", layerState.FLOOD ? "visible" : "none");
  }, [layerState]);

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
          <input value={query} onChange={(event) => { setQuery(event.target.value); setRemoteResults([]); setSearchMessage(""); }} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} />
          {query && <div className="search-results">
            {displayedResults.map((candidate) => <button type="button" key={`${candidate.source}-${candidate.id}`} onClick={() => chooseLocation(candidate)}>
              <MapPin /><span><strong>{candidate.label}</strong><small>{candidate.source === "OSM" ? "OpenStreetMap search" : language === "th" ? "ข้อมูลค้นหาสาธิต" : "Demo search index"}</small></span>
            </button>)}
            {!displayedResults.length && !searching && <p>{language === "th" ? "กด “ค้นหา” เพื่อค้นหาชื่อสถานที่ในประเทศไทย" : "Press Search to look up places in Thailand"}</p>}
          </div>}
        </div>
        <button className="btn primary search-submit" type="submit" disabled={searching}>{searching ? "…" : t.analyze}</button>
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
        <div className="radius-options large">{RADIUS_OPTIONS_KM.map((value) => <button className={radius === value ? "active" : ""} onClick={() => setRadius(value)} key={value}>{value} km</button>)}</div>

        <details className="layer-details">
          <summary><Layers3 />{language === "th" ? "ชั้นข้อมูลบนแผนที่" : "Map layers"}<span>{Object.values(layerState).filter(Boolean).length}</span></summary>
          {LAYERS.map((layer) => <label className="layer-row" key={layer.id}><input type="checkbox" checked={layerState[layer.id]} onChange={() => setLayerState((current) => ({ ...current, [layer.id]: !current[layer.id] }))} /><span className="layer-swatch" style={{ background: layer.color }} /><span>{language === "th" ? layer.labelTh : layer.label}</span></label>)}
        </details>
      </aside>

      <div className="map-canvas-wrap">
        <div ref={container} className="map-canvas" aria-label={language === "th" ? "แผนที่เลือกพื้นที่สำหรับวิเคราะห์" : "Interactive map for selecting an analysis location"} />
        <div className="fallback-map-visual" aria-hidden="true">
          <i className="dom-road road-a" /><i className="dom-road road-b" /><i className="dom-road road-c" /><i className="dom-road road-d" /><i className="dom-road road-e" />
          <span className="dom-place-label label-a">{analysis.site.district}</span><span className="dom-place-label label-b">{analysis.site.province}</span>
          <i className="dom-radius" style={{ width: `${Math.min(82, 24 + radius * 6)}%`, aspectRatio: "1" }} />
          <i className="dom-selected"><span /></i>
          {visualEntities.map((entity) => <i key={entity.id} title={entity.name} className={`dom-entity entity-${entity.kind.toLowerCase()}`} style={{ left: `${entity.left}%`, top: `${entity.top}%` }} />)}
        </div>
        <div className="map-instruction"><MousePointer2 />{language === "th" ? "คลิกจุดที่สนใจบนแผนที่" : "Click a point to analyze it"}</div>
        {tileWarning && <div className="tile-warning"><AlertTriangle />{language === "th" ? "แผนที่ถนนออนไลน์ไม่พร้อม — ยังเลือกจุดบนแผนที่สาธิตได้" : "Online road tiles unavailable — demo map selection still works"}</div>}
        <button className="map-float-btn" onClick={() => mapRef.current?.easeTo({ center: [location.longitude, location.latitude], zoom: 13.5, duration: 500 })}><Focus />{language === "th" ? "กลับไปจุดที่เลือก" : "Center selected point"}</button>
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

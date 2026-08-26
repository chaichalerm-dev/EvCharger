import type { GeoPoint, MapEntity, Site } from "@/src/domain/models";
import { catalogService } from "./catalog.service";

const clamp = (value: number, min = 0, max = 100) => Math.round(Math.max(min, Math.min(max, value)));

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const lat1 = a.latitude * rad;
  const lat2 = b.latitude * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface LocationAnalysisInput extends GeoPoint {
  label: string;
  radiusKm: number;
  areaSqm?: number;
  referenceSiteId?: string;
}

export interface LocationAnalysisResult {
  site: Site;
  nearby: MapEntity[];
  counts: { evStations: number; competitors: number; gasStations: number; pois: number; partnerBranches: number };
  nearestCompetitor: MapEntity | null;
  estimated: boolean;
}

export function analyzeLocation(input: LocationAnalysisInput): LocationAnalysisResult {
  const sites = catalogService.getSites();
  const entities = catalogService.getMapEntities();
  const point = { latitude: input.latitude, longitude: input.longitude };
  const reference = sites.find((site) => site.id === input.referenceSiteId);
  const nearestSite = reference ?? [...sites].sort((a, b) => distanceKm(point, a) - distanceKm(point, b))[0];
  const distanceToReference = distanceKm(point, nearestSite);
  const nearby = entities.filter((entity) => distanceKm(point, entity) <= input.radiusKm);
  const ofKind = (kind: MapEntity["kind"]) => nearby.filter((entity) => entity.kind === kind);
  const competitors = ofKind("COMPETITOR");
  const evStations = ofKind("EV_STATION");
  const pois = ofKind("POI");
  const gasStations = ofKind("GAS_STATION");
  const partnerBranches = ofKind("PARTNER_BRANCH");
  const nearestCompetitor = [...entities]
    .filter((entity) => entity.kind === "COMPETITOR" || entity.kind === "EV_STATION")
    .sort((a, b) => distanceKm(point, a) - distanceKm(point, b))[0] ?? null;
  const remotenessPenalty = Math.min(22, distanceToReference / 18);
  const floodRisk = distanceToReference <= 45 ? nearestSite.floodRisk : "MEDIUM";
  const areaFactor = input.areaSqm == null ? 50 : input.areaSqm >= 900 ? 96 : input.areaSqm >= 500 ? 84 : input.areaSqm >= 150 ? 68 : 45;
  const demand = clamp(nearestSite.factors.demand - remotenessPenalty);
  const competition = clamp((nearestSite.factors.competition * .45) + (100 - competitors.length * 18 - evStations.length * 7) * .55);
  const accessibility = clamp(nearestSite.factors.accessibility - remotenessPenalty * .7);
  const poi = clamp(nearestSite.factors.poi * .65 + Math.min(35, pois.length * 9 + gasStations.length * 4));
  const infrastructure = clamp(reference ? nearestSite.factors.infrastructure : nearestSite.factors.infrastructure * .75);
  const floodFactor = floodRisk === "LOW" ? 88 : floodRisk === "MEDIUM" ? 62 : 28;
  const businessPotential = clamp((demand + accessibility + poi + competition) / 4);
  const now = new Date().toISOString();
  const isKnownSite = Boolean(reference);
  const site: Site = {
    ...nearestSite,
    id: isKnownSite ? nearestSite.id : `analysis-${input.latitude.toFixed(5)}-${input.longitude.toFixed(5)}`,
    name: input.label,
    nameTh: input.label,
    address: input.label,
    addressTh: input.label,
    latitude: input.latitude,
    longitude: input.longitude,
    province: distanceToReference <= 45 ? nearestSite.province : "Unknown",
    provinceTh: distanceToReference <= 45 ? nearestSite.provinceTh : "ไม่ทราบ",
    district: distanceToReference <= 25 ? nearestSite.district : "Unknown",
    districtTh: distanceToReference <= 25 ? nearestSite.districtTh : "ไม่ทราบ",
    areaSqm: input.areaSqm ?? (isKnownSite ? nearestSite.areaSqm : undefined),
    areaVerified: isKnownSite && input.areaSqm == null ? nearestSite.areaVerified : false,
    siteType: isKnownSite ? nearestSite.siteType : "Candidate location",
    businessModel: isKnownSite ? nearestSite.businessModel : "PARTNER_HOST",
    trafficLevel: distanceToReference <= 30 ? nearestSite.trafficLevel : "MEDIUM",
    populationDensity: distanceToReference <= 45 ? Math.round((nearestSite.populationDensity ?? 5000) * Math.max(.55, 1 - distanceToReference / 120)) : undefined,
    evAdoptionEstimate: distanceToReference <= 45 ? nearestSite.evAdoptionEstimate : undefined,
    floodRisk,
    elevationMeters: isKnownSite ? nearestSite.elevationMeters : undefined,
    nearestHighwayKm: isKnownSite ? nearestSite.nearestHighwayKm : undefined,
    parkingSpaces: isKnownSite ? nearestSite.parkingSpaces : undefined,
    powerAvailability: isKnownSite ? nearestSite.powerAvailability : "Requires Site Survey",
    transformerDistanceMeters: isKnownSite ? nearestSite.transformerDistanceMeters : undefined,
    competitorsNearby: competitors.length + evStations.length,
    nearestCompetitorKm: nearestCompetitor ? Number(distanceKm(point, nearestCompetitor).toFixed(1)) : 0,
    competitorBrands: [...new Set([...competitors, ...evStations].map((entity) => entity.brand).filter(Boolean))] as string[],
    poiCounts: { nearby: pois.length },
    factors: { demand, competition, accessibility, poi, infrastructure, floodRisk: floodFactor, siteArea: areaFactor, businessPotential },
    provenance: isKnownSite ? nearestSite.provenance : {
      source: "Prototype radius model using nearby demo records",
      collectedAt: now,
      lastUpdated: now,
      confidence: "LOW",
      verifiedStatus: "ESTIMATED"
    },
    opportunityStatus: isKnownSite ? nearestSite.opportunityStatus : "LEAD"
  };
  return {
    site,
    nearby,
    counts: { evStations: evStations.length, competitors: competitors.length, gasStations: gasStations.length, pois: pois.length, partnerBranches: partnerBranches.length },
    nearestCompetitor,
    estimated: !isKnownSite
  };
}

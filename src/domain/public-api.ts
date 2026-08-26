import type { MapEntity } from "./models";

export interface WeatherSnapshot {
  temperatureC: number | null;
  precipitationMm: number | null;
  windSpeedKmh: number | null;
  weatherCode: number | null;
}

export interface HydrologySnapshot {
  currentRiverDischargeM3s: number | null;
  maxSevenDayRiverDischargeM3s: number | null;
  modelResolutionKm: number;
}

export interface PopulationSnapshot {
  totalPopulation: number | null;
  densityPerKm2: number | null;
  areaKm2: number | null;
  dataYear: number;
  source: string;
}

export interface TrafficSnapshot {
  currentSpeedKmh: number | null;
  freeFlowSpeedKmh: number | null;
  confidence: number | null;
  roadClosure: boolean | null;
}

export interface PublicLocationContext {
  osmEntities: MapEntity[];
  weather: WeatherSnapshot | null;
  elevationMeters: number | null;
  hydrology: HydrologySnapshot | null;
  population: PopulationSnapshot | null;
  traffic: TrafficSnapshot | null;
  fetchedAt: string;
  errors: string[];
  cached: boolean;
}

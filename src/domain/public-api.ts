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

export interface PublicLocationContext {
  osmEntities: MapEntity[];
  weather: WeatherSnapshot | null;
  elevationMeters: number | null;
  hydrology: HydrologySnapshot | null;
  fetchedAt: string;
  errors: string[];
  cached: boolean;
}

export const OSM_BUILDING_QUERY = {
  radiusMeters: 700,
  resultLimit: 450,
  timeoutSeconds: 12,
  clientTimeoutMs: 5_000,
  floorHeightMeters: 3.1,
  defaultHeightMeters: 6.2,
  minimumDisplayHeightMeters: 18,
  selectedMinimumDisplayHeightMeters: 32,
  maximumHeightMeters: 500,
  selectedBuildingDistanceMeters: 180,
} as const;

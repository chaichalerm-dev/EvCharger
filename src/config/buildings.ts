export const OSM_BUILDING_QUERY = {
  radiusMeters: 700,
  resultLimit: 450,
  timeoutSeconds: 12,
  clientTimeoutMs: 5_000,
  floorHeightMeters: 3.1,
  defaultHeightMeters: 6.2,
  maximumHeightMeters: 500,
  selectedBuildingDistanceMeters: 120,
} as const;

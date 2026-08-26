/**
 * Prototype navigation envelope for Thailand.
 *
 * This bounding box is intentionally a map-navigation constraint, not an
 * authoritative national-boundary dataset. A future GIS provider/PostGIS
 * polygon can replace it without changing the map UI.
 */
export const THAILAND_MAP_VIEW = {
  countryCode: "TH",
  bounds: [[97, 5], [106, 21]] as [[number, number], [number, number]],
  minZoom: 5.2,
  maxZoom: 19,
  renderWorldCopies: false
} as const;

export const MAP_MARKER_STYLE = {
  pitchAlignment: "viewport",
  pitchScale: "viewport",
  opportunityClusterRadius: 12,
  opportunityPointRadius: 6,
  entityClusterRadius: 10,
  entityPointRadius: 5.5,
  selectedHaloRadius: 12,
  selectedPointRadius: 7
} as const;

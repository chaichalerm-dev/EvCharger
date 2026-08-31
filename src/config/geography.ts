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
  overviewZoom: 5.2,
  normalZoom: 12.2,
  detailZoom: 16.2,
  entityIconScale: { overview: 0.34, normal: 0.64, detail: 0.9 },
  opportunityIconScale: { overview: 0.32, normal: 0.62, detail: 0.88 },
  clusterIconScale: { overview: 0.48, normal: 0.68, detail: 0.82 },
  clusterTextSize: { overview: 6, normal: 8, detail: 9 },
  opportunityClusterRadius: { overview: 7, normal: 10, detail: 12 },
  opportunityPointRadius: { overview: 3, normal: 5, detail: 6 },
  entityClusterRadius: { overview: 6, normal: 8.5, detail: 10 },
  entityPointRadius: { overview: 2.5, normal: 4.5, detail: 5.5 }
} as const;

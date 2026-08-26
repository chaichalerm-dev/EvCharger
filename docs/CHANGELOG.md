# Changelog

## 0.1.0 — 2026-08-26

- Created frontend-first EV expansion intelligence prototype.
- Added dashboard, MapLibre exploration, site scoring/recommendation, comparison, partners, branches, lifecycle, expansion, settings, and demo controls.
- Added browser-local submission persistence and safe local image preview.
- Added tests, Vercel/Sites build paths, future API/PostGIS architecture, security guidance, and handoff documentation.

## 0.2.0 — 2026-08-26

- Rebuilt the map journey around search → choose point → select radius → instant analysis.
- Added optional site-area input and deterministic arbitrary-point scoring.
- Added local Thailand place search with optional OpenStreetMap/Nominatim lookup.
- Added a visible local map context layer so external tile failure no longer leaves a blank map.
- Added responsive map controls and automated location-analysis coverage.
- Removed overlapping synthetic road lines and hide the local fallback when online map tiles are ready.
- Excluded the MapLibre worker from Vite dependency optimization to prevent stale development reload failures.

## 0.3.0 — 2026-08-26

- Added no-key OpenFreeMap 3D buildings rendered with MapLibre.
- Added on-demand nearby OSM/Overpass, Open-Meteo weather, approximate elevation, and river-discharge context with partial-failure handling.
- Added provider configuration, environment overrides, attribution, quota/licensing guidance, timeouts, throttling, and browser-memory caching.
- Prevented pre-hydration clicks from being silently discarded and lazy-loaded the MapLibre runtime.
- Added desktop/mobile E2E coverage for search, scoring, theme/language, 3D, and public provider context.
- Fixed the building-extrusion base expression, increased the 3D camera zoom, and now report readiness only when building features are actually rendered.
- Kept 3D buildings below opportunity, entity, analysis, and selected-location markers.
- Constrained prototype map navigation/search to Thailand and made the active coverage explicit.
- Reduced marker footprints and fixed marker scale/alignment to the viewport so zoom and 3D pitch do not make points cover the map.
- Changed markers to capped zoom interpolation so they become smaller—not visually larger—when zooming out to province or Thailand overview levels.

## 0.4.0 — 2026-08-26

- Switched runtime screens from mock repositories to Real Provider Mode with honest empty states.
- Added runtime endpoint/token controls for OSM tiles, OpenFreeMap, Nominatim, Overpass, Open-Meteo, WorldPop, TomTom, and a company Business REST API.
- Added WorldPop radius population and optional TomTom traffic flow to area analysis.
- Added a Business API resource adapter for sites, partners, branches, and opportunities.
- Kept API tokens in page memory only and documented the required production backend proxy.
- Updated critical unit/E2E coverage and provider documentation.

## 0.5.0 — 2026-08-26

- Added a collapsible desktop sidebar with device-local persistence and accessible labels; retained an explicit mobile navigation drawer.
- Changed first-run defaults to Thai and light mode while preserving saved user preferences.
- Added language-aware document metadata and bundled Noto Sans Thai/Noto Sans font selection.
- Localized primary navigation, settings, analysis, portfolio, opportunity, partner, branch, and comparison workflows in Thai and English.
- Added E2E coverage for first-run language/theme behavior and sidebar collapse persistence.

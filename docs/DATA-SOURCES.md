# Data Sources

Runtime business screens do not load bundled market fixtures. Public observations are fetched on demand, are not guaranteed real-time, and must not be treated as field verification. Legacy fixtures may remain as isolated development references/tests but are not wired into runtime repositories.

Future ingestion registers provider, license, coverage, method, cadence, timestamps, confidence, verification, and raw snapshot. Scheduled sync must be observable and idempotent. Stale records become EXPIRED.

## Connected public providers

The prototype uses public services only after an explicit user action. Endpoints and eligible browser/client keys are editable at runtime in Settings and provider implementations are isolated from business rules.

| Provider | Prototype use | Important constraint |
| --- | --- | --- |
| OpenStreetMap raster tiles | Basemap | Attribution required; public tile service has no SLA |
| OpenFreeMap vector tiles | Optional 3D buildings rendered by MapLibre | External service; 3D coverage depends on OSM building data |
| Nominatim | User-triggered place search | No autocomplete; public instance limit is 1 request/second; results cached in memory |
| Overpass API | On-demand nearby EV, fuel, and POI snapshot | Shared public capacity; request radius is capped and partial failure is supported |
| Open-Meteo Forecast | On-demand current weather context | Free/non-commercial public API; attribution and usage limits apply |
| Open-Meteo Elevation | Approximate elevation context | Copernicus DEM, approximately 90 m resolution |
| Open-Meteo Flood | River-discharge model context | Approximately 5 km resolution; never presented as verified parcel flood risk |
| WorldPop API v2 | Population and density within the selected radius polygon | Async task; 1,000 requests/day without a key and 10,000/day with an approved key at time of implementation |
| TomTom Traffic Flow | Nearest road current/free-flow speed | API key required; developer quota/licence depends on the active plan |
| Company Business REST API | Sites, partners, branches, opportunities | Customer-owned endpoint and bearer token required; no public substitute exists |

No trial key or credential is committed to source control. Runtime tokens are memory-only and clear on refresh. Commercial deployment must re-check provider licensing, quota, privacy, CORS, SLA, and attribution requirements.

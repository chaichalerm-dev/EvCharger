# Data Sources

All bundled records are demonstration fixtures. They are not a factual directory and are not real-time.

Future ingestion registers provider, license, coverage, method, cadence, timestamps, confidence, verification, and raw snapshot. Scheduled sync must be observable and idempotent. Stale records become EXPIRED.

## Connected public providers

The prototype uses no-key public services only after an explicit user action. Endpoints are configurable through `.env`; provider implementations are isolated from business rules.

| Provider | Prototype use | Important constraint |
| --- | --- | --- |
| OpenStreetMap raster tiles | Basemap | Attribution required; public tile service has no SLA |
| OpenFreeMap vector tiles | Optional 3D buildings rendered by MapLibre | External service; 3D coverage depends on OSM building data |
| Nominatim | User-triggered place search | No autocomplete; public instance limit is 1 request/second; results cached in memory |
| Overpass API | On-demand nearby EV, fuel, and POI snapshot | Shared public capacity; request radius is capped and partial failure is supported |
| Open-Meteo Forecast | On-demand current weather context | Free/non-commercial public API; attribution and usage limits apply |
| Open-Meteo Elevation | Approximate elevation context | Copernicus DEM, approximately 90 m resolution |
| Open-Meteo Flood | River-discharge model context | Approximately 5 km resolution; never presented as verified parcel flood risk |

Optional providers such as MapTiler can be configured later with environment variables. No trial key or credential is committed to source control. Commercial deployment must re-check provider licensing, quota, privacy, SLA, and attribution requirements.

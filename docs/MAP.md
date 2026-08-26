# Map

MapLibre GL JS renders OpenStreetMap raster tiles without a paid token. A clean local grid/context layer remains visible when the external tile service cannot be reached, so the primary location-selection flow does not become a blank screen. The fallback is hidden automatically after online tiles load to avoid duplicate map lines. Opportunity and entity sources are GeoJSON; opportunities use client clustering. Entity categories include EV stations, competitors, gas stations, POIs, and partner branches.

The prototype simulates radius analysis with a geodesic polygon. Users can search the bundled Thailand location index, use a user-triggered OpenStreetMap/Nominatim place lookup when available, or click any point on the map. The selected point, 1/3/5/10 km radius, and optional site area feed the standalone prototype analysis service and update scores, nearby counts, station recommendation, risks, and missing information immediately. Results for arbitrary points are always labeled Estimated / Demo Data.

Future work: authoritative provider data, heatmap source, persisted site-boundary editing, provider health reporting, and server-side/tiling strategies for large datasets.

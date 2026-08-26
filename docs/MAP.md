# Map

MapLibre GL JS renders a free OpenFreeMap base style. No paid token is required. Opportunity and entity sources are GeoJSON; opportunities use client clustering. Entity categories include EV stations, competitors, gas stations, POIs, and partner branches.

The prototype simulates radius analysis with a geodesic polygon. Clicks can drop a coordinate pin. Selected sites update the radius and intelligence panel. Flood and traffic switches are explicitly simulation-ready; production layers require real provider implementations and licensed data.

Future work: separate category sources/filters, heatmap source, persisted site-boundary editing, accessible non-map result list, provider health reporting, and server-side/tiling strategies for large datasets.

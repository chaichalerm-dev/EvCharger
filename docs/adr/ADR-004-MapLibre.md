# ADR-004: MapLibre GL JS / การเลือก MapLibre GL JS

- **Status / สถานะ:** Accepted / ยอมรับแล้ว
- **Date / วันที่:** 2026-08-26

## ภาษาไทย

### บริบท

แผนที่เป็น product surface หลัก ต้องรองรับ marker, cluster, popup, polygon, radius, layer control, 3D terrain/buildings และ provider ที่เปลี่ยนได้ โดยไม่บังคับ paid map SDK

### การตัดสินใจ

ใช้ MapLibre GL JS เป็น renderer และสร้าง style/source/layer ผ่าน adapter/config ใช้ raster OSM เป็น basemap, GeoJSON สำหรับ analysis/entity, raster DEM สำหรับ terrain และ vector fill extrusion สำหรับอาคาร

### ผลกระทบ

- ไม่มี license ผูกกับ paid core SDK
- รองรับ WebGL, clustering, expressions และ 3D
- ต้องจัด attribution และตรวจ terms ของ tile provider แยกจาก MapLibre
- Bundle ค่อนข้างใหญ่จึง lazy load runtime
- Browser/WebGL compatibility และ accessibility ต้องมี control ทางเลือก
- Provider outage ต้องมี fallback/partial state

### ทางเลือก

Leaflet เบากว่าแต่ 3D/vector expression จำกัดกว่า Google Maps/Mapbox มี ecosystem ดีแต่เพิ่ม key/licensing dependency การสร้าง canvas เองเพิ่มความเสี่ยงมากเกินไป

## English

### Context and decision

The core map needs markers, clustering, popups, polygons, radius, layers, and 3D without mandating a paid SDK. Use MapLibre GL JS with provider-configured sources: raster basemap, GeoJSON analysis/entities, raster DEM terrain, and vector building extrusions.

### Consequences and alternatives

MapLibre provides open rendering, WebGL, expressions, clustering, and 3D. The application still owns provider attribution/terms, lazy loading, browser compatibility, accessible alternative controls, and outage handling. Leaflet offered less 3D capability; commercial SDKs added key/licensing coupling; a custom renderer was unjustified.

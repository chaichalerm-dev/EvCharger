# PostGIS

Store stations and POIs as geometry(Point,4326), site boundaries as Polygon, and flood coverage as MultiPolygon. Use geography casts for metre-based distance and geometry for topology/intersections.

Candidate operations:

- ST_DWithin for radius and nearby records.
- ST_Distance for nearest competitor/station.
- ST_Intersects for flood/site overlap.
- ST_Area after transforming to a suitable projected CRS for area validation.
- ST_Contains for administrative coverage.
- ST_ClusterDBSCAN or grid/tiles for server-side clustering.

Add GiST indexes to spatial columns, bounding-box prefilters, query limits, and materialized summaries for density. Validate geometries and record CRS/accuracy. The prototype does not use PostGIS.

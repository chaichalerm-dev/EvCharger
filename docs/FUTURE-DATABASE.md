# Future Database

Use PostgreSQL with PostGIS. Suggested entities:

- User, Role, Permission and join tables.
- Partner and PartnerBranch.
- Site, SiteOpportunity, SiteAnalysis, SiteScore, ScoreFactor, ScoreConfiguration.
- EVStation, EVCharger, Competitor, GasStation, POI, FloodZone.
- StationType, StationConfiguration, BusinessScenario, InvestmentEstimate.
- DataSource, DataSnapshot, Document, SitePhoto, AuditLog, Notification.

Prototype Site maps to Site plus the latest SiteAnalysis, SiteScore, SiteOpportunity, and DataSource reference. MapEntity splits into typed station, charger, gas station, competitor, POI, and branch tables. DataProvenance maps to DataSource/DataSnapshot and per-observation quality fields.

Use UUIDs, timestamptz, explicit units, currency codes, configuration versions, soft archival where history matters, and immutable audit entries. Geometry columns use SRID 4326. Enforce foreign keys, checks, unique provider identifiers, and tenant/owner boundaries. RLS complements but never replaces backend authorization.

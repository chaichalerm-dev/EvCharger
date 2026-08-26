# Data Model

Core models: Site, MapEntity, Partner, Branch, OpportunityStatus, SiteScore, Recommendation, and StationConfiguration.

Important records include DataProvenance: source, sourceUrl, collectedAt, lastUpdated, confidence, and verifiedStatus. Coordinates use WGS84. Area fields carry independent verification state.

Transport DTOs, persistence entities, and UI view models should remain separate.

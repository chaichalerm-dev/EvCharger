# Architecture

## Current

Browser → Next.js feature UI → services/hooks → runtime provider configuration → public APIs or company Business REST API. Partner submissions retain explicitly labelled device-local prototype persistence.

MapLibre renders GIS. Public provider calls are isolated in provider classes; company collections use the Business API resource hook. Empty repositories are the safe runtime fallback, so disconnected company data produces an honest empty state rather than fixtures. React context owns only cross-feature prototype preferences. Business logic stays in pure services/configuration.

## Future

Browser → Vercel Next.js → REST API → NestJS or Go → Supabase PostgreSQL + PostGIS. The current Business API hook becomes a typed API repository/query adapter while feature components and domain models remain stable.

Boundaries are domain, configuration, repository, provider, service, then feature presentation.

## Expected API

GET /sites; GET /sites/:id; POST /sites; PATCH /sites/:id; DELETE /sites/:id; POST /sites/:id/analyze; GET /sites/:id/score; GET /sites/:id/recommendation; GET /ev-stations; GET /competitors; GET /gas-stations; GET /pois; GET /partners; POST /partners; GET /branches; GET /opportunities; GET /expansion/dashboard.

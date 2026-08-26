# Architecture

## Current

Browser → Next.js feature UI → services → repository/provider interfaces → mock fixtures or device-local prototype persistence.

MapLibre renders GIS. TanStack Query is available for repository calls. React context owns only cross-feature prototype preferences. Business logic stays in pure services/configuration.

## Future

Browser → Vercel Next.js → REST API → NestJS or Go → Supabase PostgreSQL + PostGIS. API repositories replace mock/local repositories through dependency wiring. Feature components and domain models remain stable.

Boundaries are domain, configuration, repository, provider, service, then feature presentation.

## Expected API

GET /sites; GET /sites/:id; POST /sites; PATCH /sites/:id; DELETE /sites/:id; POST /sites/:id/analyze; GET /sites/:id/score; GET /sites/:id/recommendation; GET /ev-stations; GET /competitors; GET /gas-stations; GET /pois; GET /partners; POST /partners; GET /branches; GET /opportunities; GET /expansion/dashboard.

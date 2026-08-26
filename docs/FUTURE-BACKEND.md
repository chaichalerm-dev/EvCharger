# Future Backend

## Migration path

Current: Next.js + service interfaces + mock repositories + local browser submission repository.

Future: Next.js → REST API → NestJS/Node.js or Go → Supabase PostgreSQL + PostGIS.

Implement ApiSiteRepository and related adapters behind existing contracts. Introduce DTO schemas, authentication, backend authorization, audit logging, pagination, idempotency, rate limits, observability, and standardized errors before switching dependency wiring.

Later services may add Redis caching, BullMQ/background workers, provider synchronization, scoring jobs, notifications, and document processing. These are not required for the prototype.

Scale incrementally: CDN/static assets, API cache, query/index tuning, async GIS jobs, object storage, connection pooling, read replicas, then service separation only when measured demand warrants it.

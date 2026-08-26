# ADR-008: Runtime API Connections

Status: Accepted — 2026-08-26

## Decision

Public-provider endpoints and eligible evaluation/client keys can be replaced from Settings without a code edit. Values live only in the active page's JavaScript memory. Runtime market fixtures are disabled; company screens read a configurable Business REST API and otherwise show empty states.

## Rationale

The prototype needs replaceable free/limited providers while avoiding committed credentials and the false claim that browser storage secures secrets. An in-memory adapter allows immediate experimentation and clean replacement by server-managed connections later.

## Consequences

- A full refresh intentionally clears entered tokens.
- Browser-visible provider keys can be inspected by the user and must be restricted by provider controls where available.
- Production credentials require a backend/BFF and secure session.
- The company API must support JSON arrays or `{ "data": [] }` for `/sites`, `/partners`, `/branches`, and `/opportunities`, plus CORS for the prototype origin when called directly.

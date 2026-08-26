# ADR-007: Standalone scoring engine

Status: Accepted.

Scoring and recommendation are pure, deterministic TypeScript modules. Inputs and configuration are explicit; output includes a version. Critical risk overrides live in recommendation logic and are covered by tests.

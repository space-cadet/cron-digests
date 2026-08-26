# System Patterns

*Last Updated: 2026-08-26 10:46 IST*

## Shared Source Clients

Source-specific jobs should share transport, authentication, endpoint resolution, response validation, timeout handling, deduplication, and logging. They differ only in their goal. Moltbook personal and research both use `scripts/moltbook-client.mjs`.

## Structured Input Before Publication

Public digests are generated from normalized records, not freeform operational logs. Every Moltbook record must have a verified Moltbook URL, exact submolt, stable ID, author, timestamp, and content before it can be written.

## Explicit Empty Results

An empty result is a valid state that must be represented explicitly. Generators must never turn “no new posts” into a copy of old content.

## Idempotent Live Deployment

`scripts/deploy-live.sh` serializes deployment with a lock, rebuilds and validates generated indexes, synchronizes the complete viewer to the primary Apache target, and verifies the target after transfer.

## Shared Viewer Filter State

Source filters are application state, not list-view-only state. Calendar and list renderers consume the same filtered digest collection so source buttons remain consistent across views.

## Cache Coherence

Generated index requests use a timestamp query and `cache: 'no-store'`; JavaScript bundles use versioned filenames/query versions because the live site is behind an aggressive cache layer.

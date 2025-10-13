# Account Import/Export Enhancement Plan

## Objectives

- Extend `account-import` to support merge semantics when replaying account snapshots in existing environments.
- Introduce a long-running service mode for `cmd/migratectl` that performs periodic export/import cycles for multi-node synchronization.
- Ensure multi-node deployments can exchange account data with predictable consistency and minimal operator intervention.

## Current Implementation Review

### Export Flow

- Command: `go run ./cmd/migratectl/main.go export` (aliased by `make account-export`).
- Queries the `users`, `identities`, and `sessions` tables using `internal/migrate/transfer.go`.
- Supports optional email keyword filtering and writes a YAML snapshot.

### Import Flow

- Command: `go run ./cmd/migratectl/main.go import` (aliased by `make account-import`).
- Loads the snapshot, upserts users, then **clears all identities and sessions for the listed users** before re-inserting them.
- Operates inside a single transaction and does not currently differentiate between full replacement and merge operations.
- Lacks conflict resolution strategies (last-writer-wins, field-level merge, etc.) and does not track provenance or versioning.

### Operational Constraints

- CLI-driven; no daemon/service mode.
- Operators must manually schedule exports/imports (e.g., via cron) for multi-node synchronization.
- No change detection or incremental sync; each import is effectively a full overwrite for included records.

## Gap Analysis

1. **Merge Semantics**: Current importer treats incoming snapshot as source of truth. For environments with local mutations, this can cause data loss (e.g., local sessions or new MFA state overwritten).
2. **Service Automation**: Requiring cron/scripts for periodic sync increases operational risk and complicates deployments across multiple regions.
3. **Configuration**: There is no unified configuration model for describing peer nodes, auth, or scheduling.
4. **Observability & Safety**: Missing structured logging, metrics, dry-run safeguards, and auditing for cross-node sync.

## Proposed Enhancements

### 1. Merge-capable Importer

- **CLI UX**: Add a `--merge` (bool) flag to `migratectl import` / `make account-import`. Default remains "replace" for backwards compatibility.
- **Merge Strategy**:
  - User rows: use upsert but preserve missing fields from target when snapshot omits them; optionally track `updated_at` to prefer newer records.
  - Identities/Sessions: support additive merge. Instead of wholesale delete, diff on primary keys (`uuid`, `token`) and upsert missing/changed rows. Provide `--merge-strategy` (`replace`, `append`, `timestamp`) for future extensibility.
  - Record conflicts: log decisions and expose counters.
- **Safety Mechanisms**:
  - Optional dry-run mode to preview actions (counts of inserts/updates/deletes).
  - Configurable allowlist to limit which user UUIDs are eligible for merge.
  - Validation of snapshot version/schema hash before applying.

### 2. `migratectl` Service Mode

- **Command**: `migratectl service` with flags/env for:
  - `--config` pointing to a YAML/JSON file describing peers (source/target DSN, direction).
  - `--interval` duration (minimum granularity: minutes) controlling sync frequency.
  - `--mode` (`export`, `import`, `bi-sync`).
  - `--once` to run a single cycle for debugging.
- **Runtime Behavior**:
  - Background loop orchestrating export/import using existing logic.
  - Graceful shutdown via context cancellation/OS signals.
  - Structured logging (JSON) and optional Prometheus metrics endpoint.
- **Deployment Considerations**:
  - Container-friendly: accept environment variables for DSNs/credentials.
  - Support multi-node scheduling with leader election toggle (e.g., using advisory locks or external lock service). Initial phase can rely on manual coordination.

### 3. Configuration & Sync Topology

- Introduce configuration struct (e.g., `SyncConfig`) with fields:
  - `Source` / `Target` (DSNs, credentials, TLS options).
  - `Filters` (email keyword, user groups).
  - `Merge` options (strategy, dry-run, allowlists).
  - `Retry` policy (max attempts, backoff).
- Allow multiple sync jobs in one config file to support hub-and-spoke replication.
- Document reference configuration in `docs/` and provide sample manifest.

### 4. Observability & Reliability

- Add per-cycle metrics (duration, records processed, conflicts, errors).
- Emit structured logs with job ID, peer names, counts.
- Provide health-check endpoint when running in service mode for Kubernetes readiness.
- Implement exponential backoff on failures and optional alert hook (e.g., webhook).

## Evaluation & Next Steps

1. **Design Review**: Finalize merge semantics and configuration schema with stakeholders.
2. **Prototype**: Implement importer merge flag with dry-run to validate data model impact.
3. **Service Mode MVP**:
   - Introduce `service` command using `cobra.Command`.
   - Implement scheduler loop (`time.Ticker`) with graceful shutdown.
   - Load sync jobs from config and execute sequentially; parallelism as follow-up.
4. **Testing Strategy**:
   - Unit tests for merge logic (conflict resolution, diffing).
   - Integration tests using ephemeral PostgreSQL (e.g., Testcontainers) to verify import/export symmetry.
   - End-to-end acceptance: run service across two DB instances with simulated updates.
5. **Documentation**: Update `docs/account-service-deployment.md` with new service mode and configuration guidance.
6. **Rollout Plan**: Stage in non-production environment, capture metrics, then enable merge mode incrementally per node.

## Open Questions

- Do we need bi-directional conflict resolution (two-way merges) or is one node authoritative?
- Should session records be merged or always regenerated by local services?
- What is the desired behavior for password/MFA conflicts (prefer freshest timestamp, external authority)?
- Is there a requirement for encryption/signing of snapshots during transit/storage?

Addressing these clarifications will shape the detailed implementation plan.

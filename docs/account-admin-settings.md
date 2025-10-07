# Account Service Admin Settings API

This document summarizes the new `/api/auth/admin/settings` endpoints for managing the permission matrix used by the account service.

## Endpoints

- `GET /api/auth/admin/settings`
  - Requires the caller to present `X-User-Role` or `X-Role` headers with value `admin` or `operator`.
  - Returns the latest permission matrix and associated version. The handler responds with `503 Service Unavailable` when the admin settings database has not been initialised.

- `POST /api/auth/admin/settings`
  - Accepts a JSON payload containing a `version` and `matrix`. The matrix is validated to ensure module keys are non-empty and roles are within the supported set (`admin`, `operator`, `user`).
  - Uses optimistic locking on the `version` field. When the provided version does not match the stored version the handler responds with `409 Conflict` and includes the authoritative matrix.

## Storage Model

- The permission matrix is stored in the `admin_settings` table. GORM manages the model via `account/internal/model/admin_setting.go` and a dedicated migration script (`account/sql/20250305-admin-settings.sql`).
- Each cell records `module_key`, `role`, `enabled`, and a monotonically increasing `version` value. Updates occur inside a single transaction that replaces the existing matrix to guarantee consistency across modules and roles.
- The service layer (`account/internal/service/admin_settings.go`) caches the most recent matrix in-memory and invalidates the cache whenever a write occurs or fails due to a version conflict.

## Test Coverage

Integration tests are provided in `account/api/admin_settings_test.go`:

- `TestAdminSettingsReadWrite` exercises a full write followed by a read using the operator role.
- `TestAdminSettingsUnauthorized` verifies that callers without an admin/operator role receive `403 Forbidden` responses for both GET and POST.
- `TestAdminSettingsVersionConflict` validates the optimistic locking path by replaying a stale version and asserting a `409 Conflict` response that echoes the authoritative version.

Run the suite with:

```bash
go test ./account/api -run AdminSettings
```

# Xray Single-Port Multi-User Synchronization Design

## Background

The XControl platform manages access to an Xray proxy node that exposes a single inbound port while supporting multiple end users. Xray allows sharing the same inbound by enumerating client credentials under `inbounds.settings.clients`. Each client entry contains a UUID (`id`) and an optional label (`email`). Keeping the Xray configuration aligned with the account database requires an automated synchronization mechanism.

## Goals

- Maintain a single inbound listener that multiplexes all end-user credentials.
- Add or remove client UUIDs automatically whenever account state changes in XControl.
- Ensure that regenerated configuration files are syntactically valid before applying them.
- Restart the Xray service only when a configuration change occurs and after validation succeeds.

## Non-Goals

- Managing multiple inbound listeners or transport protocols. The scope is limited to updating `inbounds.settings.clients` for a single inbound.
- Modifying other parts of the Xray configuration (e.g., routing, outbound settings).
- Providing UI flows for manual configuration edits; the process is backend-driven.

## Data Model

| Field        | Source        | Notes                                                     |
|--------------|---------------|-----------------------------------------------------------|
| `id`         | Account table | Stored as UUID v4 for compatibility with Xray clients.    |
| `email`      | Account table | Optional identifier; used for auditing and debugging.     |
| `flow`       | Derived       | Optional; defaults to `xtls-rprx-vision` for Vision mode. |
| `enabled`    | Account table | Only enabled users contribute to the generated array.     |

The backend queries all enabled accounts and materializes the JSON payload expected by Xray.

## Component Overview

```
+-----------------+     +-------------------+     +---------------------------+
| Account Service | --> | Config Generator   | --> | /usr/local/etc/xray/...   |
+-----------------+     +-------------------+     +---------------------------+
            ^                     |                           |
            |                     v                           v
            |             JSON schema validator      systemctl restart xray
            |                     |                           |
            +---------------------+---------------------------+
```

- **Account Service**: Emits events (e.g., user registration, disablement) or exposes API endpoints that trigger the synchronization job.
- **Config Generator**: Go routine/function that builds the new configuration JSON from a template and the latest client list.
- **JSON Validator**: Ensures the generated file is well-formed before Xray reload.
- **Supervisor**: Invokes `systemctl restart xray.service` if validation succeeds.

## Update Workflow

1. **Trigger**: Any operation that creates, updates, or deletes a user credential triggers the synchronization. Hook into existing user management flows (e.g., registration endpoint).
2. **Load Active Users**: Fetch all enabled users from the database, retrieving their UUID and email.
3. **Merge Clients Array**: Construct the `clients` slice (`[]Client`) ordered deterministically (e.g., sorted by creation time) to keep diffs stable.
4. **Generate Configuration**:
   - Load the base template for `/usr/local/etc/xray/config.json`.
   - Replace the `inbounds.settings.clients` node with the freshly computed array. New registrations simply append to the slice
     composed in memory before the generator writes it back. Each client entry includes the UUID, optional email, and any flow
     directive required by the transport profile.
   - Persist the resulting JSON atomically (write to temp file then move into place).
5. **Validate JSON**:
   - Run `jq . /usr/local/etc/xray/config.json` or an equivalent Go `json.Unmarshal` check to confirm syntax correctness.
   - Optionally, verify required fields (e.g., at least one inbound, TLS settings) through schema assertions.
6. **Apply Changes**:
   - If validation passes and the new file differs from the previous version, execute `systemctl restart xray.service`.
   - Log success or failure, including the number of clients synchronized.
7. **Error Handling**:
   - On failure, restore the previous configuration and alert operators.
   - Ensure retries/backoff so transient issues (e.g., temporary DB outage) do not leave the system inconsistent.

## Implementation Sketch (Go)

```go
// Client represents an entry in inbounds.settings.clients.
type Client struct {
    ID    string `json:"id"`
    Email string `json:"email"`
    Flow  string `json:"flow"`
}

func SyncXrayClients(ctx context.Context, db *sql.DB, fs afero.Fs, runner command.Runner) error {
    clients, err := loadEnabledClients(ctx, db)
    if err != nil {
        return fmt.Errorf("load clients: %w", err)
    }

    cfg, err := loadBaseConfig(fs)
    if err != nil {
        return fmt.Errorf("load base config: %w", err)
    }

    cfg.Inbounds[0].Settings.Clients = clients
    for i := range cfg.Inbounds[0].Settings.Clients {
        if cfg.Inbounds[0].Settings.Clients[i].Flow == "" {
            cfg.Inbounds[0].Settings.Clients[i].Flow = "xtls-rprx-vision"
        }
    }

    buf, err := json.MarshalIndent(cfg, "", "  ")
    if err != nil {
        return fmt.Errorf("marshal config: %w", err)
    }

    if err := writeAtomically(fs, "/usr/local/etc/xray/config.json", buf); err != nil {
        return fmt.Errorf("write config: %w", err)
    }

    if err := validateJSON(buf); err != nil {
        return fmt.Errorf("validate config: %w", err)
    }

    return runner.Run(ctx, "systemctl", "restart", "xray.service")
}
```

The concrete implementation should wire in dependency-injected collaborators for database access, filesystem operations, validation, and command execution to simplify testing.

The initial `Config Generator` module lives at `account/internal/xrayconfig`. It loads `account/config/xray.config.template.json`,
overwrites the client array with the current database view (setting `flow` to `xtls-rprx-vision` unless callers request a
different value), and writes the merged document to `/usr/local/etc/xray/config.json` using an atomic rename so that Xray always
observes a complete file.

## Operational Considerations

- **Atomic Writes**: Write the new configuration to `/usr/local/etc/xray/config.json.tmp` and `os.Rename` it into place to avoid partial files.
- **Permissions**: The service account running the backend must have write access to the Xray config path and permission to restart the service (e.g., via sudoers entry).
- **Audit Logging**: Log each synchronization with the count of clients and a checksum of the generated array for troubleshooting.
- **Monitoring**: Expose metrics such as `xray_sync_success_total` and `xray_sync_duration_seconds` to observe reliability.

## Future Enhancements

- **Inotify Hooks**: Instead of restarting the service, consider using Xray's hot-reload API if available to reduce downtime.
- **Template Versioning**: Store the base config template in version control and tag deployments so rollbacks are traceable.
- **Dry-Run Mode**: Provide an administrative command to preview the generated configuration without applying it.
- **Event-Driven Sync**: Replace polling with message-based events (e.g., via Redis or Kafka) to react more quickly to account changes.

## Summary

By centralizing client credential management in the database and regenerating the Xray configuration dynamically, XControl can support a single inbound port for multiple users. Automating validation and restart steps keeps the service consistent and minimizes operator intervention.

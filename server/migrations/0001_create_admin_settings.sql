CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    module_key VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL,
    enabled BOOLEAN NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (module_key, role)
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_version ON admin_settings (version);

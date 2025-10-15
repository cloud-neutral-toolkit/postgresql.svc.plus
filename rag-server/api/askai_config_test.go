package api

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

// TestLoadConfig_FromFile verifies configuration values are read from ConfigPath.
func TestLoadConfig_FromFile(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "server.yaml")
	data := []byte("models:\n  generator:\n    models: [\"llama2:13b\"]\n    endpoint: http://localhost:11434/v1/chat/completions\n    token: t1\napi:\n  askai:\n    timeout: 10\n    retries: 2\n")
	if err := os.WriteFile(cfgPath, data, 0o644); err != nil {
		t.Fatalf("write config: %v", err)
	}

	old := ConfigPath
	ConfigPath = cfgPath
	t.Cleanup(func() { ConfigPath = old })

	token, model, endpoint, timeout, retries := loadConfig()
	if token != "t1" {
		t.Fatalf("token = %q", token)
	}
	if model != "llama2:13b" {
		t.Fatalf("model = %q", model)
	}
	if endpoint != "http://localhost:11434/v1/chat/completions" {
		t.Fatalf("endpoint = %q", endpoint)
	}
	if timeout != 10*time.Second {
		t.Fatalf("timeout = %v", timeout)
	}
	if retries != 2 {
		t.Fatalf("retries = %d", retries)
	}
}

// TestLoadConfig_EnvOverrides ensures environment variables override config values.
func TestLoadConfig_EnvOverrides(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "server.yaml")
	data := []byte("models:\n  generator:\n    models: [\"llama2:13b\"]\n    endpoint: http://localhost:11434/v1/chat/completions\napi:\n  askai:\n    timeout: 50\n    retries: 5\n")
	if err := os.WriteFile(cfgPath, data, 0o644); err != nil {
		t.Fatalf("write config: %v", err)
	}

	old := ConfigPath
	ConfigPath = cfgPath
	t.Cleanup(func() { ConfigPath = old })

	os.Setenv("CHUTES_API_MODEL", "env-model")
	os.Setenv("CHUTES_API_URL", "http://env.local/v1/chat/completions")
	t.Cleanup(func() {
		os.Unsetenv("CHUTES_API_MODEL")
		os.Unsetenv("CHUTES_API_URL")
	})

	token, model, endpoint, timeout, retries := loadConfig()
	if model != "env-model" {
		t.Fatalf("model = %q", model)
	}
	if endpoint != "http://env.local/v1/chat/completions" {
		t.Fatalf("endpoint = %q", endpoint)
	}
	if timeout != 50*time.Second {
		t.Fatalf("timeout = %v", timeout)
	}
	if retries != 3 {
		t.Fatalf("retries = %d", retries)
	}
	if token != "" {
		t.Fatalf("token = %q", token)
	}
}

package config

import (
	"os"
	"testing"
	"time"
)

// TestLoad ensures the configuration file is loaded correctly.
func TestLoad(t *testing.T) {
	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("getwd: %v", err)
	}
	// change to repository root so Load can read server/config/server.yaml
	if err := os.Chdir("../.."); err != nil {
		t.Fatalf("chdir: %v", err)
	}
	t.Cleanup(func() { os.Chdir(wd) })

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load returned error: %v", err)
	}
	if cfg.Global.Redis.Addr != "127.0.0.1:6379" {
		t.Fatalf("unexpected redis addr %q", cfg.Global.Redis.Addr)
	}
	if cfg.API.AskAI.Timeout != 100 {
		t.Fatalf("unexpected askai timeout %d", cfg.API.AskAI.Timeout)
	}
	if cfg.Server.Addr != ":8090" {
		t.Fatalf("unexpected server addr %q", cfg.Server.Addr)
	}
	if cfg.Server.ReadTimeout.Duration != 15*time.Second {
		t.Fatalf("unexpected server read timeout %s", cfg.Server.ReadTimeout)
	}
	if cfg.Server.WriteTimeout.Duration != 15*time.Second {
		t.Fatalf("unexpected server write timeout %s", cfg.Server.WriteTimeout)
	}
}

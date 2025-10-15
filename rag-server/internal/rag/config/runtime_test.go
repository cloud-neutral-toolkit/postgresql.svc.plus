package config

import "testing"

func TestVectorDB_DSN(t *testing.T) {
	v := VectorDB{
		PGHost:     "localhost",
		PGUser:     "user",
		PGPassword: "pass",
		PGDBName:   "db",
		PGPort:     5433,
		PGSSLMode:  "disable",
	}
	got := v.DSN()
	want := "postgres://user:pass@localhost:5433/db?sslmode=disable"
	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestResolveEmbedding(t *testing.T) {
	cfg := &Config{}
	cfg.Models.Embedder.Provider = "p1"
	cfg.Models.Embedder.Endpoint = "https://api.example.com"
	cfg.Models.Embedder.Token = "tok"
	cfg.Models.Embedder.Models = []string{"m"}
	e := cfg.ResolveEmbedding()
	if e.Endpoint != "https://api.example.com" {
		t.Fatalf("unexpected endpoint %q", e.Endpoint)
	}
	if e.APIKey != "tok" {
		t.Fatalf("unexpected api key %q", e.APIKey)
	}
	if e.Model != "m" {
		t.Fatalf("unexpected model %q", e.Model)
	}
}

func TestResolveChunking(t *testing.T) {
	cfg := &Config{}
	ch := cfg.ResolveChunking()
	if ch.MaxTokens != 800 || ch.OverlapTokens != 80 {
		t.Fatalf("defaults not applied: %+v", ch)
	}
	if len(ch.IncludeExts) == 0 || len(ch.IgnoreDirs) == 0 {
		t.Fatalf("expected default slices")
	}
}

func TestRuntimeToConfigEmbedding(t *testing.T) {
	rt := &Runtime{}
	rt.Embedding.Endpoint = "http://localhost:8080"
	rt.Embedding.APIKey = "tok"
	rt.Embedding.Dimension = 123
	cfg := rt.ToConfig()
	if cfg.Models.Embedder.Endpoint != "http://localhost:8080" {
		t.Fatalf("unexpected base url %q", cfg.Models.Embedder.Endpoint)
	}
	if cfg.Models.Embedder.Token != "tok" {
		t.Fatalf("unexpected token %q", cfg.Models.Embedder.Token)
	}
	if cfg.Embedding.Dimension != 123 {
		t.Fatalf("unexpected dimension %d", cfg.Embedding.Dimension)
	}
}

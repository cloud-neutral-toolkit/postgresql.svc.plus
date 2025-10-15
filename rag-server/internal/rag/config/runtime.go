package config

import (
	"os"
	"path/filepath"
	"strings"
)

// RuntimeEmbedding is the resolved embedding configuration used at runtime.
type RuntimeEmbedding struct {
	Provider     string
	Endpoint     string
	APIKey       string
	Model        string
	Dimension    int
	RateLimitTPM int
	MaxBatch     int
	MaxChars     int
}

// ResolveEmbedding applies fallback logic to produce runtime embedding settings.
func (c *Config) ResolveEmbedding() RuntimeEmbedding {
	var rt RuntimeEmbedding
	m := c.Models.Embedder
	rt.Provider = m.Provider
	if len(m.Models) > 0 {
		rt.Model = m.Models[0]
	}
	rt.Endpoint = strings.TrimRight(m.Endpoint, "/")
	rt.APIKey = m.Token

	e := c.Embedding
	rt.Dimension = e.Dimension
	rt.RateLimitTPM = e.RateLimitTPM
	rt.MaxBatch = e.MaxBatch
	rt.MaxChars = e.MaxChars
	return rt
}

// ResolveChunking returns chunking configuration with defaults applied.
func (c *Config) ResolveChunking() ChunkingCfg {
	ch := c.Chunking
	if ch.MaxTokens == 0 {
		ch.MaxTokens = 800
	}
	if ch.OverlapTokens == 0 {
		ch.OverlapTokens = 80
	}
	if len(ch.IncludeExts) == 0 {
		ch.IncludeExts = []string{".md", ".mdx"}
	}
	if len(ch.IgnoreDirs) == 0 {
		ch.IgnoreDirs = []string{".git", "node_modules", "dist", "build"}
	}
	return ch
}

// Runtime holds runtime configuration for RAG features.
type Runtime struct {
	Redis struct {
		Addr     string `yaml:"addr"`
		Password string `yaml:"password"`
	} `yaml:"redis"`
	VectorDB    VectorDB     `yaml:"vectordb"`
	Datasources []DataSource `yaml:"datasources"`
	Proxy       string       `yaml:"proxy"`
	Embedding   RuntimeEmbedding
	Reranker    ModelCfg
	Retrieval   struct {
		Alpha      float64 `yaml:"alpha"`
		Candidates int     `yaml:"candidates"`
	} `yaml:"retrieval"`
}

// ServerConfigPath points to the server configuration file.
var ServerConfigPath = filepath.Join("server", "config", "server.yaml")

// resolveServerConfigPath tries to find the server configuration relative to the
// current working directory and the executable location. This helps when the
// binary is invoked outside of the repository root.
func resolveServerConfigPath() string {
	if filepath.IsAbs(ServerConfigPath) {
		return ServerConfigPath
	}
	if _, err := os.Stat(ServerConfigPath); err == nil {
		return ServerConfigPath
	}
	if exe, err := os.Executable(); err == nil {
		dir := filepath.Dir(exe)
		cand := filepath.Join(dir, ServerConfigPath)
		if _, err := os.Stat(cand); err == nil {
			return cand
		}
		cand = filepath.Join(dir, "..", ServerConfigPath)
		if _, err := os.Stat(cand); err == nil {
			return cand
		}
	}
	return ServerConfigPath
}

// LoadServer loads global configuration from ServerConfigPath.
func LoadServer() (*Runtime, error) {
	cfg, err := Load(resolveServerConfigPath())
	if err != nil {
		return nil, err
	}
	rt := &Runtime{
		VectorDB:    cfg.Global.VectorDB,
		Datasources: cfg.Global.Datasources,
		Proxy:       cfg.Global.Proxy,
	}
	rt.Redis = cfg.Global.Redis
	rt.Embedding = cfg.ResolveEmbedding()
	rt.Reranker = cfg.Models.Reranker
	rt.Retrieval = cfg.Retrieval
	return rt, nil
}

// ToConfig converts runtime configuration into service configuration.
func (rt *Runtime) ToConfig() *Config {
	if rt == nil {
		return nil
	}
	var c Config
	c.Global.Redis = rt.Redis
	c.Global.VectorDB = rt.VectorDB
	c.Global.Datasources = rt.Datasources
	c.Global.Proxy = rt.Proxy
	c.Models.Embedder.Provider = rt.Embedding.Provider
	c.Models.Embedder.Endpoint = rt.Embedding.Endpoint
	c.Models.Embedder.Token = rt.Embedding.APIKey
	if rt.Embedding.Model != "" {
		c.Models.Embedder.Models = []string{rt.Embedding.Model}
	}
	c.Models.Reranker = rt.Reranker
	c.Retrieval = rt.Retrieval
	c.Embedding.Dimension = rt.Embedding.Dimension
	c.Embedding.MaxBatch = rt.Embedding.MaxBatch
	c.Embedding.MaxChars = rt.Embedding.MaxChars
	c.Embedding.RateLimitTPM = rt.Embedding.RateLimitTPM
	return &c
}

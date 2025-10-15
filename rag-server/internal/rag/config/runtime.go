package config

import (
	"net"
	"net/url"
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

// ResolveServerURL determines the base URL for talking to the rag-server API.
// When SERVER_URL is not provided via environment variables, the CLI falls
// back to this value. Preference is given to an explicit base URL, otherwise
// the listener address is converted into an HTTP URL pointing to localhost.
func (c *Config) ResolveServerURL() string {
	if c == nil {
		return ""
	}
	base := strings.TrimSpace(c.Server.BaseURL)
	if base != "" {
		if !strings.HasPrefix(base, "http://") && !strings.HasPrefix(base, "https://") {
			base = "http://" + base
		}
		return strings.TrimRight(base, "/")
	}
	addr := strings.TrimSpace(c.Server.Addr)
	if addr == "" {
		return ""
	}
	if strings.Contains(addr, "://") {
		if u, err := url.Parse(addr); err == nil {
			u.Path = ""
			u.RawQuery = ""
			u.Fragment = ""
			return strings.TrimRight(u.String(), "/")
		}
		return strings.TrimRight(addr, "/")
	}
	host := addr
	port := ""

	if strings.HasPrefix(host, ":") {
		port = strings.TrimPrefix(host, ":")
		host = ""
	} else if h, p, err := net.SplitHostPort(host); err == nil {
		host = h
		port = p
	} else if strings.Count(host, ":") == 1 {
		parts := strings.SplitN(host, ":", 2)
		host = parts[0]
		port = parts[1]
	}

	host = strings.TrimSpace(host)
	port = strings.TrimSpace(port)

	if port == "" {
		port = "8090"
	}

	if host == "" || host == "0.0.0.0" || host == "127.0.0.1" {
		host = "localhost"
	}

	return "http://" + strings.TrimRight(net.JoinHostPort(host, port), "/")
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

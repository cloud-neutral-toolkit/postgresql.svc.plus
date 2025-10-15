package server

import (
	"log/slog"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
	"gopkg.in/yaml.v3"
)

// Config represents server configuration loaded from YAML.
type Config struct {
	Models struct {
		Generator struct {
			Provider string   `yaml:"provider"`
			Models   []string `yaml:"models"`
			Endpoint string   `yaml:"endpoint"`
			Token    string   `yaml:"token"`
		} `yaml:"generator"`
	} `yaml:"models"`
}

// cfg holds the loaded configuration.
var cfg Config

// loadConfig reads config/server.yaml and sets environment variables.
func loadConfig() {
	path := filepath.Join("server", "config", "server.yaml")
	data, err := os.ReadFile(path)
	if err != nil {
		slog.Warn("server config", "err", err)
		return
	}
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		slog.Warn("server config parse", "err", err)
		return
	}
	g := cfg.Models.Generator
	if strings.ToLower(g.Provider) == "chutes" {
		if g.Token != "" {
			os.Setenv("CHUTES_API_TOKEN", g.Token)
		}
		if g.Endpoint != "" {
			os.Setenv("CHUTES_API_URL", g.Endpoint)
		}
		if len(g.Models) > 0 {
			os.Setenv("CHUTES_API_MODEL", g.Models[0])
		}
	}
}

// Registrar registers routes on the provided gin engine.
type Registrar func(*gin.Engine)

// New creates a gin engine with all CPU cores enabled and applies the provided route registrars.
func New(registrars ...Registrar) *gin.Engine {
	loadConfig()
	runtime.GOMAXPROCS(runtime.NumCPU())
	r := gin.Default()
	for _, register := range registrars {
		if register != nil {
			register(r)
		}
	}
	return r
}

package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// DataSource represents a repository and a path to ingest.
type DataSource struct {
	Name string `yaml:"name"`
	Repo string `yaml:"repo"`
	Path string `yaml:"path"`
}

// VectorDB configuration for PostgreSQL with pgvector.
type VectorDB struct {
	PGURL      string `yaml:"pgurl"`
	PGHost     string `yaml:"pg_host"`
	PGPort     int    `yaml:"pg_port"`
	PGUser     string `yaml:"pg_user"`
	PGPassword string `yaml:"pg_password"`
	PGDBName   string `yaml:"pg_db_name"`
	PGSSLMode  string `yaml:"pg_sslmode"`
}

// DSN returns the PostgreSQL connection string derived from individual fields
// when PGURL is not provided.
func (v VectorDB) DSN() string {
	if v.PGURL != "" {
		return v.PGURL
	}
	if v.PGHost == "" || v.PGUser == "" || v.PGDBName == "" {
		return ""
	}
	port := v.PGPort
	if port == 0 {
		port = 5432
	}
	ssl := v.PGSSLMode
	if ssl == "" {
		ssl = "require"
	}
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s", v.PGUser, v.PGPassword, v.PGHost, port, v.PGDBName, ssl)
}

// Global configuration shared by server and CLI.
type Global struct {
	Redis struct {
		Addr     string `yaml:"addr"`
		Password string `yaml:"password"`
	} `yaml:"redis"`
	VectorDB    VectorDB     `yaml:"vectordb"`
	Datasources []DataSource `yaml:"datasources"`
	Proxy       string       `yaml:"proxy"`
}

type Sync struct {
	Repo struct {
		Proxy string `yaml:"proxy"`
	} `yaml:"repo"`
}

// StringSlice supports unmarshaling from either a single string or a list of strings.
type StringSlice []string

// UnmarshalYAML implements yaml unmarshaling for StringSlice.
func (s *StringSlice) UnmarshalYAML(value *yaml.Node) error {
	switch value.Kind {
	case yaml.ScalarNode:
		var str string
		if err := value.Decode(&str); err != nil {
			return err
		}
		*s = []string{str}
	case yaml.SequenceNode:
		var arr []string
		if err := value.Decode(&arr); err != nil {
			return err
		}
		*s = arr
	default:
		return fmt.Errorf("invalid yaml kind for StringSlice: %v", value.Kind)
	}
	return nil
}

// ModelCfg describes a model service such as embedder or generator.
type ModelCfg struct {
	Provider string      `yaml:"provider"`
	Models   StringSlice `yaml:"models"`
	BaseURL  string      `yaml:"baseurl"`
	Endpoint string      `yaml:"endpoint"`
	Token    string      `yaml:"token"`
}

// EmbeddingCfg describes embedding service settings.
type EmbeddingCfg struct {
	MaxBatch     int `yaml:"max_batch"`
	Dimension    int `yaml:"dimension"`
	MaxChars     int `yaml:"max_chars"`
	RateLimitTPM int `yaml:"rate_limit_tpm"`
}

// ChunkingCfg controls how markdown is split into chunks.
type ChunkingCfg struct {
	MaxTokens           int      `yaml:"max_tokens"`
	OverlapTokens       int      `yaml:"overlap_tokens"`
	PreferHeadingSplit  bool     `yaml:"prefer_heading_split"`
	IncludeExts         []string `yaml:"include_exts"`
	IgnoreDirs          []string `yaml:"ignore_dirs"`
	ByParagraph         bool     `yaml:"by_paragraph"`
	EmbedHeadings       bool     `yaml:"embed_headings"`
	EmbedTOC            bool     `yaml:"embed_toc"`
	AdditionalMaxTokens []int    `yaml:"additional_max_tokens"`
}

// Config is the root configuration for ingestion.
type Config struct {
	Global Global `yaml:"global"`
	Sync   Sync   `yaml:"sync"`
	Models struct {
		Embedder  ModelCfg `yaml:"embedder"`
		Generator ModelCfg `yaml:"generator"`
		Reranker  ModelCfg `yaml:"reranker"`
	} `yaml:"models"`
	Embedding EmbeddingCfg `yaml:"embedding"`
	Chunking  ChunkingCfg  `yaml:"chunking"`
	Retrieval struct {
		Alpha      float64 `yaml:"alpha"`
		Candidates int     `yaml:"candidates"`
	} `yaml:"retrieval"`
	API struct {
		AskAI struct {
			Timeout int `yaml:"timeout"`
			Retries int `yaml:"retries"`
		} `yaml:"askai"`
	} `yaml:"api"`
}

// Load reads YAML configuration from the given path.
func Load(path string) (*Config, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var c Config
	if err := yaml.Unmarshal(b, &c); err != nil {
		return nil, err
	}
	return &c, nil
}

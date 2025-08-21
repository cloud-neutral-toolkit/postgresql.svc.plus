package config

import "os"

type Config struct {
	Addr        string
	DatabaseURL string
	RedisURL    string
	Tenant      string
}

func Load() Config {
	return Config{
		Addr:        getEnv("IDP_ADDR", ":8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost:5432/idp"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379/0"),
		Tenant:      getEnv("TENANT", "public"),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

package config

import "os"

type Config struct {
	Addr         string
	DatabaseURL  string
	RedisURL     string
	Tenant       string
	LDAPURL      string
	LDAPBindDN   string
	LDAPPassword string
	LDAPBaseDN   string
	LDAPFilter   string
}

func Load() Config {
	return Config{
		Addr:         getEnv("IDP_ADDR", ":8080"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://localhost:5432/idp"),
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379/0"),
		Tenant:       getEnv("TENANT", "public"),
		LDAPURL:      getEnv("LDAP_URL", ""),
		LDAPBindDN:   getEnv("LDAP_BIND_DN", ""),
		LDAPPassword: getEnv("LDAP_PASSWORD", ""),
		LDAPBaseDN:   getEnv("LDAP_BASE_DN", ""),
		LDAPFilter:   getEnv("LDAP_FILTER", "(objectClass=person)"),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

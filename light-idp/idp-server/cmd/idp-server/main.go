package main

import (
	"log"
	"net/http"

	"light-idp/internal/config"
	httpserver "light-idp/internal/http"
	ldapsync "light-idp/internal/ldap"
	"light-idp/internal/store"
)

func main() {
	cfg := config.Load()
	st := store.NewMemoryStore()
	if cfg.LDAPURL != "" {
		err := ldapsync.Sync(ldapsync.Config{
			URL:      cfg.LDAPURL,
			BindDN:   cfg.LDAPBindDN,
			Password: cfg.LDAPPassword,
			BaseDN:   cfg.LDAPBaseDN,
			Filter:   cfg.LDAPFilter,
		}, st)
		if err != nil {
			log.Printf("ldap sync failed: %v", err)
		}
	}
	srv := &http.Server{
		Addr:    cfg.Addr,
		Handler: httpserver.NewRouter(),
	}
	log.Printf("starting idp server on %s", cfg.Addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
	_ = st
}

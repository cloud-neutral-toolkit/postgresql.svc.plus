package main

import (
	"log"
	"net/http"

	"light-idp/internal/config"
	httpserver "light-idp/internal/http"
)

func main() {
	cfg := config.Load()
	srv := &http.Server{
		Addr:    cfg.Addr,
		Handler: httpserver.NewRouter(),
	}
	log.Printf("starting idp server on %s", cfg.Addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

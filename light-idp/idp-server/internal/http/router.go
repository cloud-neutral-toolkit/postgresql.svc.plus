package httpserver

import (
	"net/http"

	"light-idp/internal/middleware"
	"light-idp/internal/oidc"
	"light-idp/internal/store"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	oidc.SetStore(store.NewMemoryStore())
	mux.HandleFunc("/authorize", oidc.HandleAuthorize)
	mux.HandleFunc("/token", oidc.HandleToken)
	mux.HandleFunc("/userinfo", oidc.HandleUserInfo)
	mux.HandleFunc("/.well-known/openid-configuration", oidc.HandleDiscovery)
	mux.HandleFunc("/jwks", oidc.HandleJWKS)
	mux.Handle("/logout", middleware.Session(http.HandlerFunc(oidc.HandleLogout)))
	return mux
}

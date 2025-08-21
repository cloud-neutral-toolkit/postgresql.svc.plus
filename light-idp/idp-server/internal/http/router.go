package httpserver

import (
	"net/http"

	"light-idp/internal/middleware"
	"light-idp/internal/oidc"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/authorize", oidc.HandleAuthorize)
	mux.HandleFunc("/token", func(w http.ResponseWriter, r *http.Request) {
		oidc.HandleToken(w, r)
	})
	mux.HandleFunc("/userinfo", oidc.HandleUserInfo)
	mux.HandleFunc("/.well-known/openid-configuration", oidc.HandleDiscovery)
	mux.HandleFunc("/jwks", oidc.HandleJWKS)
	mux.Handle("/logout", middleware.Session(http.HandlerFunc(oidc.HandleLogout)))
	return mux
}

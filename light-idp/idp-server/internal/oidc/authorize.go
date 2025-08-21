package oidc

import (
	"net/http"
	"net/url"

	"github.com/google/uuid"
)

// HandleAuthorize parses OAuth2 authorization requests and issues a simple
// authorization code by redirecting back to the client.
func HandleAuthorize(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	clientID := r.Form.Get("client_id")
	redirectURI := r.Form.Get("redirect_uri")
	responseType := r.Form.Get("response_type")
	state := r.Form.Get("state")
	userID := r.Form.Get("user_id")

	if clientID == "" || redirectURI == "" || responseType != "code" {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	u, err := url.Parse(redirectURI)
	if err != nil {
		http.Error(w, "invalid redirect_uri", http.StatusBadRequest)
		return
	}
	code := uuid.New().String()
	authCodes[code] = userID
	q := u.Query()
	q.Set("code", code)
	if state != "" {
		q.Set("state", state)
	}
	u.RawQuery = q.Encode()
	http.Redirect(w, r, u.String(), http.StatusFound)
}

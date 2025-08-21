package oidc

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	oidclib "github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-jose/go-jose/v3/jwt"
	"github.com/google/uuid"
)

// HandleToken validates an authorization code and returns signed ID and access
// tokens. A refresh token is generated and persisted via the configured
// UserStore.
func HandleToken(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if r.Form.Get("grant_type") != "authorization_code" {
		http.Error(w, "unsupported grant type", http.StatusBadRequest)
		return
	}
	code := r.Form.Get("code")
	userID, ok := authCodes[code]
	if !ok {
		http.Error(w, "invalid code", http.StatusBadRequest)
		return
	}
	delete(authCodes, code)

	clientID := r.Form.Get("client_id")
	now := time.Now()
	claims := jwt.Claims{
		Issuer:   "http://localhost",
		Subject:  userID,
		Audience: jwt.Audience{clientID},
		Expiry:   jwt.NewNumericDate(now.Add(time.Hour)),
		IssuedAt: jwt.NewNumericDate(now),
	}
	rawIDToken, err := jwt.Signed(signer).Claims(claims).CompactSerialize()
	if err != nil {
		http.Error(w, "failed to sign", http.StatusInternalServerError)
		return
	}
	accessToken := uuid.New().String()
	refreshToken := uuid.New().String()
	if userStore != nil {
		userStore.SaveRefreshToken(userID, refreshToken)
	}

	// ensure scope contains openid
	scope := r.Form.Get("scope")
	if !strings.Contains(scope, oidclib.ScopeOpenID) {
		scope = scope + " " + oidclib.ScopeOpenID
	}

	resp := map[string]string{
		"access_token":  accessToken,
		"id_token":      rawIDToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"scope":         scope,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

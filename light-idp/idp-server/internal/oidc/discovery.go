package oidc

import (
	"encoding/json"
	"net/http"
)

// HandleDiscovery returns OpenID Connect discovery metadata.
func HandleDiscovery(w http.ResponseWriter, r *http.Request) {
	issuer := "http://" + r.Host
	meta := map[string]interface{}{
		"issuer":                                issuer,
		"authorization_endpoint":                issuer + "/authorize",
		"token_endpoint":                        issuer + "/token",
		"userinfo_endpoint":                     issuer + "/userinfo",
		"jwks_uri":                              issuer + "/jwks",
		"response_types_supported":              []string{"code"},
		"subject_types_supported":               []string{"public"},
		"id_token_signing_alg_values_supported": []string{"RS256"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meta)
}

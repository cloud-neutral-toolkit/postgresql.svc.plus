package oidc

import (
	"encoding/json"
	"net/http"
)

// HandleJWKS serves the JSON Web Key Set containing the public signing key.
func HandleJWKS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"keys": []interface{}{jwk}})
}

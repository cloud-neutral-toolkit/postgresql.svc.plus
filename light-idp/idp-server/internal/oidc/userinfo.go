package oidc

import (
	"encoding/json"
	"net/http"

	"light-idp/internal/models"
)

// HandleUserInfo returns user claims from the authenticated session.
func HandleUserInfo(w http.ResponseWriter, r *http.Request) {
	v := r.Context().Value("user")
	user, ok := v.(models.User)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	claims := map[string]string{
		"sub":   user.ID,
		"email": user.Email,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(claims)
}

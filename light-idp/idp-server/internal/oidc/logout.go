package oidc

import "net/http"

// HandleLogout revokes the user's refresh token and ends the session.
func HandleLogout(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userStore != nil && userID != "" {
		userStore.RevokeRefreshToken(userID)
	}
	w.WriteHeader(http.StatusOK)
}

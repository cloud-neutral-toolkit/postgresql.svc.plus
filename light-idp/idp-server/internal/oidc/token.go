package oidc

import (
	"net/http"

	oidc "github.com/coreos/go-oidc/v3/oidc"
)

func HandleToken(w http.ResponseWriter, r *http.Request) (*oidc.IDToken, error) {
	return nil, nil
}

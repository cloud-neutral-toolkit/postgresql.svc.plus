package oidc

import (
	"crypto/rand"
	"crypto/rsa"

	jose "github.com/go-jose/go-jose/v3"

	"light-idp/internal/store"
)

var (
	userStore  store.UserStore
	authCodes  = make(map[string]string)
	signingKey *rsa.PrivateKey
	signer     jose.Signer
	jwk        jose.JSONWebKey
)

func init() {
	signingKey, _ = rsa.GenerateKey(rand.Reader, 2048)
	signer, _ = jose.NewSigner(jose.SigningKey{Algorithm: jose.RS256, Key: signingKey}, nil)
	jwk = jose.JSONWebKey{Key: &signingKey.PublicKey, Algorithm: string(jose.RS256), Use: "sig", KeyID: "1"}
}

// SetStore configures the store used by handlers.
func SetStore(s store.UserStore) {
	userStore = s
}

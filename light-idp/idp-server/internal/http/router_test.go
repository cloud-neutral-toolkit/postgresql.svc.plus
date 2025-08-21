package httpserver

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"light-idp/internal/models"
	"light-idp/internal/oidc"
	"light-idp/internal/store"
)

func TestOIDCFlow(t *testing.T) {
	s := store.NewMemoryStore()
	oidc.SetStore(s)
	router := NewRouter()
	// overwrite store set by router
	oidc.SetStore(s)

	// Authorization request
	req := httptest.NewRequest("GET", "/authorize?response_type=code&client_id=abc&redirect_uri=http://client/cb&scope=openid&state=xyz&user_id=123", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusFound {
		t.Fatalf("authorize status = %d", rr.Code)
	}
	loc, err := url.Parse(rr.Header().Get("Location"))
	if err != nil {
		t.Fatalf("parse redirect: %v", err)
	}
	code := loc.Query().Get("code")

	// Token request
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("client_id", "abc")
	req = httptest.NewRequest("POST", "/token", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr = httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("token status = %d", rr.Code)
	}
	var tokResp map[string]string
	json.NewDecoder(rr.Body).Decode(&tokResp)
	if tokResp["refresh_token"] == "" {
		t.Fatalf("no refresh token returned")
	}
	u, err := s.Get("123")
	if err != nil || u.RefreshToken != tokResp["refresh_token"] {
		t.Fatalf("refresh token not stored")
	}

	// Userinfo
	ctx := context.WithValue(context.Background(), "user", models.User{ID: "123", Email: "a@example.com"})
	req = httptest.NewRequest("GET", "/userinfo", nil).WithContext(ctx)
	rr = httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("userinfo status = %d", rr.Code)
	}

	// Logout
	req = httptest.NewRequest("GET", "/logout?user_id=123", nil)
	rr = httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("logout status = %d", rr.Code)
	}
	u, _ = s.Get("123")
	if u.RefreshToken != "" {
		t.Fatalf("refresh token not revoked")
	}

	// Discovery
	req = httptest.NewRequest("GET", "/.well-known/openid-configuration", nil)
	rr = httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("discovery status = %d", rr.Code)
	}

	// JWKS
	req = httptest.NewRequest("GET", "/jwks", nil)
	rr = httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("jwks status = %d", rr.Code)
	}
}

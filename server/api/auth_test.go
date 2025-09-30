package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHandleAuthRegisterSuccess(t *testing.T) {
	gin.SetMode(gin.TestMode)

	account := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != "/v1/register" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		var payload map[string]string
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["email"] != "user@example.com" {
			t.Fatalf("unexpected email: %s", payload["email"])
		}
		w.WriteHeader(http.StatusCreated)
	}))
	defer account.Close()

	prevClient := accountServiceHTTPClient
	accountServiceHTTPClient = account.Client()
	t.Cleanup(func() { accountServiceHTTPClient = prevClient })

	t.Setenv("ACCOUNT_SERVICE_URL", account.URL)

	router := gin.New()
	registerAuthRoutes(router.Group("/api"))

	form := url.Values{}
	form.Set("name", "Example User")
	form.Set("email", "user@example.com")
	form.Set("password", "password123")
	form.Set("confirmPassword", "password123")

	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()

	router.ServeHTTP(res, req)

	if res.Code != http.StatusSeeOther {
		t.Fatalf("expected status %d, got %d", http.StatusSeeOther, res.Code)
	}
	if location := res.Header().Get("Location"); location != "/login?registered=1" {
		t.Fatalf("unexpected location: %s", location)
	}
}

func TestHandleAuthRegisterMissingFields(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	registerAuthRoutes(router.Group("/api"))

	form := url.Values{}
	form.Set("email", "")
	form.Set("password", "secret123")
	form.Set("confirmPassword", "secret123")

	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()

	router.ServeHTTP(res, req)

	if res.Code != http.StatusSeeOther {
		t.Fatalf("expected status %d, got %d", http.StatusSeeOther, res.Code)
	}
	if location := res.Header().Get("Location"); location != "/register?error=missing_fields" {
		t.Fatalf("unexpected location: %s", location)
	}
}

func TestHandleAuthRegisterPasswordMismatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	registerAuthRoutes(router.Group("/api"))

	form := url.Values{}
	form.Set("email", "user@example.com")
	form.Set("password", "secret123")
	form.Set("confirmPassword", "secret321")

	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()

	router.ServeHTTP(res, req)

	if res.Code != http.StatusSeeOther {
		t.Fatalf("expected status %d, got %d", http.StatusSeeOther, res.Code)
	}
	if location := res.Header().Get("Location"); location != "/register?error=password_mismatch" {
		t.Fatalf("unexpected location: %s", location)
	}
}

func TestHandleAuthRegisterServiceError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	account := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user already exists"})
	}))
	defer account.Close()

	prevClient := accountServiceHTTPClient
	accountServiceHTTPClient = account.Client()
	t.Cleanup(func() { accountServiceHTTPClient = prevClient })

	t.Setenv("ACCOUNT_SERVICE_URL", account.URL)

	router := gin.New()
	registerAuthRoutes(router.Group("/api"))

	form := url.Values{}
	form.Set("email", "user@example.com")
	form.Set("password", "secret123")
	form.Set("confirmPassword", "secret123")

	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()

	router.ServeHTTP(res, req)

	if res.Code != http.StatusSeeOther {
		t.Fatalf("expected status %d, got %d", http.StatusSeeOther, res.Code)
	}
	if location := res.Header().Get("Location"); location != "/register?error=user+already+exists" {
		t.Fatalf("unexpected location: %s", location)
	}
}

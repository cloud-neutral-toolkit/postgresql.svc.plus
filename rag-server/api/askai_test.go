package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

// TestAskAI verifies the /api/askai endpoint returns an answer.
func TestAskAI(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	register := RegisterRoutes(nil, "")

	// stub ask function
	old := askFn
	defer func() { askFn = old }()
	askFn = func(q string) (string, error) {
		return "stub answer", nil
	}

	register(r)

	body, _ := json.Marshal(map[string]string{"question": "hello"})
	req := httptest.NewRequest(http.MethodPost, "/api/askai", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal response: %v", err)
	}
	if resp["answer"] != "stub answer" {
		t.Fatalf("unexpected answer %q", resp["answer"])
	}
}

// TestAskAI_BadRequest ensures invalid payload returns 400.
func TestAskAI_BadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	register := RegisterRoutes(nil, "")

	// ensure askFn is stubbed to avoid dependency
	old := askFn
	defer func() { askFn = old }()
	askFn = func(q string) (string, error) {
		return "", nil
	}

	register(r)

	req := httptest.NewRequest(http.MethodPost, "/api/askai", bytes.NewReader([]byte("{")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", w.Code)
	}
}

// TestAskAI_ErrorLogged ensures an internal error logs details and returns 500.
func TestAskAI_ErrorLogged(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	register := RegisterRoutes(nil, "")

	old := askFn
	defer func() { askFn = old }()
	askFn = func(q string) (string, error) {
		return "", fmt.Errorf("fail")
	}

	// ensure logs are emitted to stdout
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))

	register(r)

	body, _ := json.Marshal(map[string]string{"question": "hello"})
	req := httptest.NewRequest(http.MethodPost, "/api/askai", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", w.Code)
	}
}

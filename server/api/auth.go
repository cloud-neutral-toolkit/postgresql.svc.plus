package api

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const defaultAccountServiceURL = "http://localhost:8080"

var accountServiceHTTPClient = &http.Client{Timeout: 10 * time.Second}

func registerAuthRoutes(r *gin.RouterGroup) {
	r.POST("/auth/register", handleAuthRegister)
}

func handleAuthRegister(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("name"))
	email := strings.ToLower(strings.TrimSpace(c.PostForm("email")))
	password := c.PostForm("password")
	confirm := c.PostForm("confirmPassword")

	if email == "" || password == "" {
		redirectWithError(c, "missing_fields")
		return
	}

	if password != confirm {
		redirectWithError(c, "password_mismatch")
		return
	}

	payload := map[string]string{
		"name":     name,
		"email":    email,
		"password": password,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		slog.Error("marshal register payload", "err", err)
		redirectWithError(c, "registration_failed")
		return
	}

	req, err := http.NewRequestWithContext(
		c.Request.Context(),
		http.MethodPost,
		accountServiceRegisterURL(),
		bytes.NewReader(body),
	)
	if err != nil {
		slog.Error("create account service request", "err", err)
		redirectWithError(c, "registration_failed")
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := accountServiceHTTPClient.Do(req)
	if err != nil {
		slog.Error("call account service", "err", err)
		redirectWithError(c, "registration_failed")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var result struct {
			Error string `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			slog.Error("decode account service error", "err", err)
		}
		message := strings.TrimSpace(result.Error)
		if message == "" {
			message = "registration_failed"
		}
		redirectWithError(c, message)
		return
	}

	redirectToLogin(c)
}

func redirectWithError(c *gin.Context, message string) {
	target := &url.URL{Path: "/register"}
	values := url.Values{}
	values.Set("error", message)
	target.RawQuery = values.Encode()
	c.Redirect(http.StatusSeeOther, target.String())
}

func redirectToLogin(c *gin.Context) {
	target := &url.URL{Path: "/login"}
	values := url.Values{}
	values.Set("registered", "1")
	target.RawQuery = values.Encode()
	c.Redirect(http.StatusSeeOther, target.String())
}

func accountServiceRegisterURL() string {
	base := strings.TrimSuffix(resolveAccountServiceBaseURL(), "/")
	return base + "/v1/register"
}

func resolveAccountServiceBaseURL() string {
	candidates := []string{
		os.Getenv("ACCOUNT_SERVICE_URL"),
		os.Getenv("ACCOUNT_SERVICE_BASE_URL"),
		os.Getenv("NEXT_PUBLIC_ACCOUNT_SERVICE_URL"),
	}
	for _, candidate := range candidates {
		candidate = strings.TrimSpace(candidate)
		if candidate != "" {
			return candidate
		}
	}
	return defaultAccountServiceURL
}

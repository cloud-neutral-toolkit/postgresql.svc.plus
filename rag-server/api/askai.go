package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gopkg.in/yaml.v3"
)

// askFn performs the chat completion request. It is replaceable in tests.
var askFn = callLLM

// registerAskAIRoutes wires the /api/askai endpoint.
func registerAskAIRoutes(r *gin.RouterGroup) {
	r.POST("/askai", func(c *gin.Context) {
		var req struct {
			Question string `json:"question"`
		}
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var chunks any
		if ragSvc != nil {
			docs, _ := ragSvc.Query(c.Request.Context(), req.Question, 5)
			chunks = docs
		}

		answer, err := askFn(req.Question)
		if err != nil {
			_, _, endpoint, timeout, retries := loadConfig()
			slog.Error("askai request failed",
				"question", req.Question,
				"endpoint", endpoint,
				"err", err,
			)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
				"config": gin.H{
					"timeout": timeout.Seconds(),
					"retries": retries,
				},
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"answer": answer,
			"chunks": chunks,
		})
	})
}

// ConfigPath points to the server configuration file.
var ConfigPath = filepath.Join("server", "config", "server.yaml")

type serverConfig struct {
	Models struct {
		Generator struct {
			Models   []string `yaml:"models"`
			Endpoint string   `yaml:"endpoint"`
			Token    string   `yaml:"token"`
		} `yaml:"generator"`
	} `yaml:"models"`
	API struct {
		AskAI struct {
			Timeout int `yaml:"timeout"` // seconds
			Retries int `yaml:"retries"`
		} `yaml:"askai"`
	} `yaml:"api"`
}

// loadConfig reads model, endpoint, timeout and retries from ConfigPath
// and environment variables.
func loadConfig() (string, string, string, time.Duration, int) {
	model := os.Getenv("CHUTES_API_MODEL")
	endpoint := os.Getenv("CHUTES_API_URL")
	token := ""
	timeout := 30 * time.Second
	retries := 3
	data, err := os.ReadFile(ConfigPath)
	if err == nil {
		var cfg serverConfig
		if err := yaml.Unmarshal(data, &cfg); err == nil {
			g := cfg.Models.Generator
			if model == "" && len(g.Models) > 0 {
				model = g.Models[0]
			}
			if endpoint == "" {
				endpoint = g.Endpoint
			}
			if token == "" {
				token = g.Token
			}
			if cfg.API.AskAI.Timeout > 0 {
				timeout = time.Duration(cfg.API.AskAI.Timeout) * time.Second
			}
			if cfg.API.AskAI.Retries > 0 {
				retries = cfg.API.AskAI.Retries
			}
		}
	}
	// Allow custom timeout values without imposing a hard cap.
	if retries > 3 {
		retries = 3
	}
	endpoint = strings.TrimRight(endpoint, "/")
	if model == "" {
		if token == "" || strings.Contains(endpoint, "127.0.0.1") || strings.Contains(endpoint, "localhost") {
			model = "llama2:13b"
		} else {
			model = "moonshotai/Kimi-K2-Instruct"
		}
	}
	return token, model, endpoint, timeout, retries
}

// callLLM dispatches the question to the configured endpoint.
func callLLM(question string) (string, error) {
	token, model, url, timeout, retries := loadConfig()

	httpClient := &http.Client{Timeout: timeout}

	payload := map[string]any{
		"model":    model,
		"messages": []map[string]string{{"role": "user", "content": question}},
	}
	body, _ := json.Marshal(payload)
	var lastErr error
	for i := 0; i <= retries; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			cancel()
			return "", fmt.Errorf("build request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		resp, err := httpClient.Do(req)
		if err == nil && resp != nil {
			data, readErr := io.ReadAll(resp.Body)
			resp.Body.Close()
			if readErr == nil && resp.StatusCode < 300 {
				var out struct {
					Choices []struct {
						Message struct {
							Content string `json:"content"`
						} `json:"message"`
					} `json:"choices"`
				}
				if err = json.Unmarshal(data, &out); err == nil && len(out.Choices) > 0 {
					cancel()
					return out.Choices[0].Message.Content, nil
				}
			} else if readErr != nil {
				err = readErr
			} else {
				err = fmt.Errorf(resp.Status)
			}
		}
		cancel()
		lastErr = err
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("request failed")
	}
	return "", fmt.Errorf("%w (timeout=%s retries=%d)", lastErr, timeout, retries)
}

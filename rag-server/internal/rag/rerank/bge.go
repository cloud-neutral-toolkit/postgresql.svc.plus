package rerank

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// BGE implements a reranker backed by a bge-reranker service.
type BGE struct {
	endpoint string
	token    string
	client   *http.Client
}

// NewBGE returns a new BGE reranker.
func NewBGE(endpoint, token string) *BGE {
	return &BGE{
		endpoint: endpoint,
		token:    token,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Rerank posts query and docs to the service and returns scores.
func (b *BGE) Rerank(ctx context.Context, query string, docs []string) ([]float32, error) {
	payload := map[string]any{"query": query, "documents": docs}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, b.endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if b.token != "" {
		req.Header.Set("Authorization", "Bearer "+b.token)
	}
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("rerank failed: %s", resp.Status)
	}
	var out struct {
		Scores []float32 `json:"scores"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	if len(out.Scores) != len(docs) {
		return nil, fmt.Errorf("unexpected scores length")
	}
	return out.Scores, nil
}

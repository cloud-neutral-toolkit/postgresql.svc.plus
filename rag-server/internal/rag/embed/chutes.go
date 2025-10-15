package embed

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Chutes implements the Embedder interface for Chutes embedding services.
type Chutes struct {
	endpoint string
	token    string
	dim      int
	client   *http.Client
}

// NewChutes creates a new Chutes embedder.
func NewChutes(endpoint, token string, dim int) *Chutes {
	return &Chutes{
		endpoint: endpoint,
		token:    token,
		dim:      dim,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Dimension returns the embedding dimension if known.
func (c *Chutes) Dimension() int { return c.dim }

// Embed posts texts to the Chutes embedding endpoint.
func (c *Chutes) Embed(ctx context.Context, inputs []string) ([][]float32, int, error) {
	payload := map[string]any{"inputs": inputs}
	body, _ := json.Marshal(payload)
	headers := map[string]string{"Content-Type": "application/json"}
	if c.token != "" {
		headers["Authorization"] = "Bearer " + c.token
	}
	resp, err := postWithRetry(ctx, c.client, c.endpoint, body, headers)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return nil, 0, &HTTPError{Code: resp.StatusCode, Status: fmt.Sprintf("embed failed: %s", resp.Status)}
	}

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	var out struct {
		Data [][]float32 `json:"data"`
	}

	if err := json.Unmarshal(b, &out); err != nil || len(out.Data) == 0 {
		if err := json.Unmarshal(b, &out.Data); err != nil {
			return nil, 0, err
		}
	}

	if len(out.Data) != len(inputs) {
		return nil, 0, fmt.Errorf("embedding count mismatch")
	}
	if c.dim == 0 && len(out.Data) > 0 {
		c.dim = len(out.Data[0])
	}
	return out.Data, 0, nil
}

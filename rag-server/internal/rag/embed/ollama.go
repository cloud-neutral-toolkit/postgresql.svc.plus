package embed

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Ollama implements the Embedder interface using the Ollama embeddings API.
type Ollama struct {
	endpoint string
	model    string
	dim      int
	client   *http.Client
}

// NewOllama creates a new Ollama embedder.
func NewOllama(endpoint, model string, dim int) *Ollama {
	return &Ollama{
		endpoint: strings.TrimRight(endpoint, "/"),
		model:    model,
		dim:      dim,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Dimension returns the embedding dimension if known.
func (a *Ollama) Dimension() int { return a.dim }

// Embed posts texts to the Ollama embeddings endpoint.
func (a *Ollama) Embed(ctx context.Context, inputs []string) ([][]float32, int, error) {
	vecs := make([][]float32, len(inputs))
	url := a.endpoint
	for i, text := range inputs {
		payload := map[string]any{"model": a.model, "prompt": text}
		body, _ := json.Marshal(payload)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			return nil, 0, err
		}
		req.Header.Set("Content-Type", "application/json")
		resp, err := a.client.Do(req)
		if err != nil {
			return nil, 0, err
		}
		if resp.StatusCode >= 300 {
			resp.Body.Close()
			return nil, 0, &HTTPError{Code: resp.StatusCode, Status: fmt.Sprintf("embed failed: %s", resp.Status)}
		}
		data, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			return nil, 0, err
		}
		var out struct {
			Embedding []float64 `json:"embedding"`
		}
		if err := json.Unmarshal(data, &out); err != nil {
			return nil, 0, err
		}
		if a.dim == 0 {
			a.dim = len(out.Embedding)
		}
		vec := make([]float32, len(out.Embedding))
		for j, v := range out.Embedding {
			vec[j] = float32(v)
		}
		vecs[i] = vec
	}
	return vecs, 0, nil
}

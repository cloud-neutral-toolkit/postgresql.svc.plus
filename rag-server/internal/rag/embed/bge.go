package embed

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// BGE implements the Embedder interface for a BGE embedding service.
type BGE struct {
	endpoint string
	token    string
	dim      int
	client   *http.Client
}

// NewBGE returns a new BGE embedder.
func NewBGE(endpoint, token string, dim int) *BGE {
	return &BGE{
		endpoint: endpoint,
		token:    token,
		dim:      dim,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Dimension returns the embedding dimension if known.
func (b *BGE) Dimension() int { return b.dim }

// Embed posts texts to the BGE service and returns embeddings.
func (b *BGE) Embed(ctx context.Context, inputs []string) ([][]float32, int, error) {
	vecs := make([][]float32, len(inputs))
	for i, text := range inputs {
		payload := map[string]any{"inputs": text}
		body, _ := json.Marshal(payload)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, b.endpoint, bytes.NewReader(body))
		if err != nil {
			return nil, 0, err
		}
		req.Header.Set("Content-Type", "application/json")
		if b.token != "" {
			req.Header.Set("Authorization", "Bearer "+b.token)
		}
		resp, err := b.client.Do(req)
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
			Embedding []float32 `json:"embedding"`
		}
		if err := json.Unmarshal(data, &out); err != nil || len(out.Embedding) == 0 {
			// try raw array format
			var arr []float32
			if err := json.Unmarshal(data, &arr); err != nil || len(arr) == 0 {
				// some services return [[..]] even for single input
				var arr2 [][]float32
				if err := json.Unmarshal(data, &arr2); err != nil || len(arr2) == 0 {
					return nil, 0, err
				}
				arr = arr2[0]
			}
			out.Embedding = arr
		}

		if b.dim == 0 {
			b.dim = len(out.Embedding)
		}
		vecs[i] = out.Embedding
	}
	return vecs, 0, nil
}

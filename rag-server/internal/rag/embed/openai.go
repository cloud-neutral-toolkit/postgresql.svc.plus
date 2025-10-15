package embed

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

// OpenAI implements the Embedder interface using OpenAI-compatible APIs.
type OpenAI struct {
	endpoint string
	apiKey   string
	model    string
	dim      int
	client   *http.Client
}

// NewOpenAI creates a new OpenAI embedder from configuration.
func NewOpenAI(endpoint, apiKey, model string, dim int) *OpenAI {
	return &OpenAI{
		endpoint: endpoint,
		apiKey:   apiKey,
		model:    model,
		dim:      dim,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Dimension returns the embedding dimension if known.
func (o *OpenAI) Dimension() int { return o.dim }

// Embed embeds the inputs and returns vectors and token usage.
func (o *OpenAI) Embed(ctx context.Context, inputs []string) ([][]float32, int, error) {
	payload := map[string]any{"input": inputs}
	if o.model != "" {
		payload["model"] = o.model
	}
	b, _ := json.Marshal(payload)
	headers := map[string]string{"Content-Type": "application/json"}
	if o.apiKey != "" {
		headers["Authorization"] = "Bearer " + o.apiKey
	}
	resp, err := postWithRetry(ctx, o.client, o.endpoint, b, headers)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return nil, 0, &HTTPError{Code: resp.StatusCode, Status: fmt.Sprintf("embed failed: %s", resp.Status)}
	}
	var out struct {
		Data []struct {
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
		Usage struct {
			TotalTokens int `json:"total_tokens"`
		} `json:"usage"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, 0, err
	}
	if len(out.Data) != len(inputs) {
		return nil, 0, errors.New("embedding count mismatch")
	}
	if o.dim == 0 && len(out.Data) > 0 {
		o.dim = len(out.Data[0].Embedding)
	}
	vecs := make([][]float32, len(out.Data))
	for i, d := range out.Data {
		vecs[i] = d.Embedding
	}
	return vecs, out.Usage.TotalTokens, nil
}

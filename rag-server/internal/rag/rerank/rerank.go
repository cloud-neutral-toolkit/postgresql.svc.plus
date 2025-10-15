package rerank

import "context"

// Reranker scores a list of documents for a given query.
type Reranker interface {
	Rerank(ctx context.Context, query string, docs []string) ([]float32, error)
}

package embed

import "context"

// Embedder defines embedding operations.
type Embedder interface {
	Embed(ctx context.Context, inputs []string) ([][]float32, int, error)
	Dimension() int
}

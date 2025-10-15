package embed

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBGEEmbedArray(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[0.1,0.2]`))
	}))
	defer srv.Close()

	emb := NewBGE(srv.URL, "", 0)
	vecs, _, err := emb.Embed(context.Background(), []string{"foo"})
	if err != nil {
		t.Fatalf("Embed returned error: %v", err)
	}
	if len(vecs) != 1 || len(vecs[0]) != 2 {
		t.Fatalf("unexpected embedding: %#v", vecs)
	}
}

func TestBGEEmbedObject(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"embedding":[0.3,0.4]}`))
	}))
	defer srv.Close()

	emb := NewBGE(srv.URL, "", 0)
	vecs, _, err := emb.Embed(context.Background(), []string{"bar"})
	if err != nil {
		t.Fatalf("Embed returned error: %v", err)
	}
	if len(vecs) != 1 || len(vecs[0]) != 2 {
		t.Fatalf("unexpected embedding: %#v", vecs)
	}
}

func TestBGEEmbedNestedArray(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[[0.5,0.6]]`))
	}))
	defer srv.Close()

	emb := NewBGE(srv.URL, "", 0)
	vecs, _, err := emb.Embed(context.Background(), []string{"baz"})
	if err != nil {
		t.Fatalf("Embed returned error: %v", err)
	}
	if len(vecs) != 1 || len(vecs[0]) != 2 {
		t.Fatalf("unexpected embedding: %#v", vecs)
	}
}

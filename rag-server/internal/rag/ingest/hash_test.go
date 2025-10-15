package ingest

import (
	"os"
	"testing"
)

func TestHashString(t *testing.T) {
	h1 := HashString("hello")
	h2 := HashString("hello")
	if h1 != h2 {
		t.Fatalf("hashes differ: %s vs %s", h1, h2)
	}
}

func TestHashFile(t *testing.T) {
	f, err := os.CreateTemp(t.TempDir(), "hash")
	if err != nil {
		t.Fatalf("temp: %v", err)
	}
	f.WriteString("content")
	f.Close()
	h1, err := HashFile(f.Name())
	if err != nil {
		t.Fatalf("hash1: %v", err)
	}
	h2, err := HashFile(f.Name())
	if err != nil {
		t.Fatalf("hash2: %v", err)
	}
	if h1 != h2 {
		t.Fatalf("file hashes differ")
	}
}

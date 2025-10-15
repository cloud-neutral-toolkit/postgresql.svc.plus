package stats

import "testing"

// TestCollect verifies Collect returns nil.
func TestCollect(t *testing.T) {
	if err := Collect(); err != nil {
		t.Fatalf("Collect returned error: %v", err)
	}
}

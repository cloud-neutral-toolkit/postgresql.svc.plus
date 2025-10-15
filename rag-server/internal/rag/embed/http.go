package embed

import (
	"bytes"
	"context"
	"net/http"
	"time"
)

// postWithRetry sends an HTTP POST request with basic retry and backoff for
// rate limiting or transient server errors.
func postWithRetry(ctx context.Context, client *http.Client, url string, body []byte, headers map[string]string) (*http.Response, error) {
	var resp *http.Response
	var err error
	for i := 0; i < 3; i++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			return nil, err
		}
		for k, v := range headers {
			req.Header.Set(k, v)
		}
		resp, err = client.Do(req)
		if err != nil {
			if i == 2 {
				return nil, err
			}
		} else if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= 500 {
			if i == 2 {
				return resp, nil
			}
			resp.Body.Close()
		} else {
			return resp, nil
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Duration(1<<i) * time.Second):
		}
	}
	return resp, err
}

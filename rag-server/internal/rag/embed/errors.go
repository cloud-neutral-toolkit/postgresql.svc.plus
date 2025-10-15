package embed

// HTTPError represents an HTTP error returned by embedding services.
type HTTPError struct {
	Code   int
	Status string
}

// Error implements the error interface.
func (e *HTTPError) Error() string {
	return e.Status
}

// StatusCode returns the HTTP status code associated with the error.
func (e *HTTPError) StatusCode() int {
	return e.Code
}

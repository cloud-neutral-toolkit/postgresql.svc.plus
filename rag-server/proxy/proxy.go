package proxy

import (
	"context"
	gclient "github.com/go-git/go-git/v5/plumbing/transport/client"
	ghttp "github.com/go-git/go-git/v5/plumbing/transport/http"
	xproxy "golang.org/x/net/proxy"
	"net"
	"net/http"
	"net/url"
)

// Set configures global HTTP and go-git clients to route through the given proxy URL.
// The proxyURL may be in formats like "http://host:port" or "socks5://host:port".
func Set(proxyURL string) {
	if proxyURL == "" {
		return
	}
	u, err := url.Parse(proxyURL)
	if err != nil {
		return
	}
	tr := http.DefaultTransport.(*http.Transport).Clone()
	switch u.Scheme {
	case "socks5", "socks5h":
		dialer, err := xproxy.FromURL(u, xproxy.Direct)
		if err != nil {
			return
		}
		tr.Proxy = nil
		if d, ok := dialer.(xproxy.ContextDialer); ok {
			tr.DialContext = d.DialContext
		} else {
			tr.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
				return dialer.Dial(network, addr)
			}
		}
	default:
		tr.Proxy = http.ProxyURL(u)
	}
	http.DefaultTransport = tr
	c := &http.Client{Transport: tr}
	gclient.InstallProtocol("https", ghttp.NewClient(c))
	gclient.InstallProtocol("http", ghttp.NewClient(c))
}

// With sets the proxy for the duration of fn and restores previous settings afterwards.
func With(proxyURL string, fn func() error) error {
	if proxyURL == "" {
		return fn()
	}
	prevTransport, _ := http.DefaultTransport.(*http.Transport)
	prevHTTP := gclient.Protocols["http"]
	prevHTTPS := gclient.Protocols["https"]
	Set(proxyURL)
	defer func() {
		http.DefaultTransport = prevTransport
		gclient.InstallProtocol("http", prevHTTP)
		gclient.InstallProtocol("https", prevHTTPS)
	}()
	return fn()
}

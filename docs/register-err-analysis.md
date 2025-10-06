# Register API Connection Error Analysis

This note explains why browsers visiting `https://www.svc.plus/register` see a `net::ERR_CONNECTION_REFUSED` response when the **Register** page tries to submit its form.

## Frontend behaviour

The Next.js client assembles the registration endpoint from `getAccountServiceBaseUrl()`. When no environment overrides are provided, that helper falls back to `http://localhost:8080` and POSTs to `http://localhost:8080/api/auth/register` from the browser.

In production, end users are **not** running a service on `localhost:8080`, so their browser immediately fails to open the TCP connection and reports `ERR_CONNECTION_REFUSED`.

## Reverse proxy expectations

The `homepage-dynamic.svc.plus.conf` nginx configuration shows that the platform expects browsers to talk to `/api/auth/*` on the public domain. nginx then proxies those requests to the Go authentication service listening on `127.0.0.1:8080`.

Therefore the correct public URL for the register call should stay on the `https://www.svc.plus` origin (e.g. `https://www.svc.plus/api/auth/register`) so that the traffic flows through nginx and reaches the upstream service.

## Resolution

Configure the frontend with the production account-service base URL (for example by setting `ACCOUNT_SERVICE_BASE_URL=https://www.svc.plus`) or otherwise ensure that it emits relative `/api/auth/...` URLs. Once the client stops pointing browsers at `http://localhost:8080`, the nginx proxy can handle the requests and the connection succeeds.

If the environment forces an `http://www.svc.plus` override, modern browsers will still refuse to POST from the `https://www.svc.plus` page because of mixed-content restrictions. The register form now upgrades same-host overrides to HTTPS on the client so that nginx receives `https://www.svc.plus/api/auth/register` even when the configured base URL is insecure.

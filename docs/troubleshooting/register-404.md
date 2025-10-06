# Registration 404 troubleshooting

If the registration form fails with a `404` in the network tab even though the
Account Service is reachable, double-check the URL the browser is posting to.
The frontend page at `/register` renders the form, but it does not accept
`POST` requests itself. API calls must go through the Next.js route exposed at
`/api/auth/register`, which proxies the request to the Account Service.

Recent builds automatically coerce a misconfigured
`NEXT_PUBLIC_REGISTER_URL` that points to `/register` to the correct
`/api/auth/register` endpoint. If you are debugging an older build or the error
persists, unset the override so that the default endpoint is used or point the
variable to the API handler directly (for example,
`https://svc.plus/api/auth/register`).

Related source files:

- `ui/homepage/app/register/RegisterContent.tsx` – reads
  `NEXT_PUBLIC_REGISTER_URL` and submits the form to that URL.
- `ui/homepage/app/api/auth/register/route.ts` – handles the
  `/api/auth/register` requests and forwards them to the account service.
- `account/api/api.go` – exposes the `POST /api/auth/register` handler inside the
  account service.

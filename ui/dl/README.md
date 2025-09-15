# dl.svc.plus

Static download portal built with Next.js. It powers the `dl.svc.plus` section of the homepage and reads `manifest.json` and per-directory `dir.json` files (with optional `tldr.md` and `README.md`) to render card and detail views for public downloads.

## Development

```bash
yarn install
yarn dev
```

Set `NEXT_PUBLIC_DL_BASE_URL` to the object storage endpoint (including
the bucket path) before starting the dev server if you want to load data
from a location other than the default `https://dl.svc.plus`. For
example:

```bash
NEXT_PUBLIC_DL_BASE_URL=https://storage.example.com/my-bucket yarn dev
```

from a location other than the default `https://dl.svc.plus`.


## Build & Deploy

```bash
yarn build
```

The build outputs a static site in `out/`. Upload the contents of `out/`
to your object storage root. The storage root must also contain
`manifest.json` and each bucket directory with its `dir.json`, optional
`tldr.md`, and `README.md`. Set `NEXT_PUBLIC_DL_BASE_URL` during build to
point the exported site at your own storage endpoint and bucket, e.g.:

```bash
NEXT_PUBLIC_DL_BASE_URL=https://storage.example.com/my-bucket yarn build
```

point the exported site at your own storage endpoint and bucket.


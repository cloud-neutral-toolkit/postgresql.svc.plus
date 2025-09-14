# dl.svc.plus

Static download portal built with Next.js. It reads `manifest.json` and per-directory `dir.json` files to render an index and detail views.

## Development

```bash
yarn install
yarn dev
```

## Build & Deploy

```bash
yarn build
```

The build outputs a static site in `out/`. Upload the contents of `out/` to your object storage root. The storage root must also contain `manifest.json` and each bucket directory with its `dir.json`, optional `tldr.md`, and `README.md`.

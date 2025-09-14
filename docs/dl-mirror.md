# Download Mirror Storage Layout

This document describes the directory layout and metadata files required for the `ui/dl` static download portal.

## Root Objects

The root of the object storage bucket must contain:

- `manifest.json` – lists all top-level buckets shown on the homepage.
- one subdirectory per bucket (e.g. `deb/`, `xray-core/`).

Example `manifest.json`:

```json
{
  "generated_at": "2025-09-13T12:00:00Z",
  "roots": [
    {
      "name": "xray-core",
      "href": "/xray-core/",
      "updated_at": "2025-09-01T10:36:00Z",
      "item_count": 7,
      "summary": "Xray-core offline bundles"
    }
  ]
}
```

## Bucket Contents

Each bucket directory must include:

- `dir.json` – metadata for the bucket or subdirectory.
- optional `tldr.md` – short usage snippet rendered on the right panel.
- optional `README.md` – detailed documentation.
- artifact files, checksums, SBOMs, etc.

Example `dir.json`:

```json
{
  "path": "/xray-core/",
  "updated_at": "2025-09-01T10:36:00Z",
  "tldr": "/xray-core/tldr.md",
  "readme": "/xray-core/README.md",
  "items": [
    {
      "name": "xray-core-offline-amd64-1.8.7.tar.gz",
      "size": 148723441,
      "updated_at": "2025-09-01T10:36:00Z",
      "href": "/xray-core/xray-core-offline-amd64-1.8.7.tar.gz",
      "sha256": "/xray-core/sha256sum.txt"
    }
  ]
}
```

Each `items` entry corresponds to a file or subdirectory. If `sha256` is present, the UI exposes a copyable verification command.

## Deployment

After running `next build && next export` inside `ui/dl`, upload the `out/` directory to the root of the object storage bucket alongside `manifest.json` and the per-bucket directories.

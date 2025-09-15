#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generate mirror metadata for the ui/dl static download portal.

- Writes <root>/manifest.json
- Writes <dir>/dir.json for every directory, recursively

Paths in JSON use leading "/" (URL-style) and directory hrefs end with "/".
`sha256` for an item is set if a sibling "<file>.sha256sum" exists, or if the
directory contains "SHA256SUMS" (then that path is referenced).

Usage:
  python3 scripts/gen_mirror_manifest.py \
    --root /data/update-server \
    --base-url-prefix /

This script is idempotent and safe to re-run.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Heuristic summaries for top-level buckets (optional sugar)
SUMMARY_OVERRIDES = {
    "offline-package": "Offline installers & air-gapped bundles",
    "xray-core": "Xray-core releases",
    "xstream": "XStream app releases (multi-platform)",
    "otel": "OpenTelemetry collectors & tools",
    "deb": "Debian packages",
    "rpm": "RPM packages",
}

HIDE_NAMES = {".git", ".github", ".DS_Store"}

def iso8601(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def is_hidden(name: str) -> bool:
    return name.startswith(".") or name in HIDE_NAMES

def latest_mtime(path: Path) -> float:
    """Latest mtime under a directory (or the file itself)."""
    if path.is_file():
        return path.stat().st_mtime
    m = path.stat().st_mtime
    for p, _, files in os.walk(path):
        for f in files:
            fp = Path(p) / f
            try:
                mt = fp.stat().st_mtime
                if mt > m:
                    m = mt
            except FileNotFoundError:
                pass
    return m

def rel_url(root: Path, path: Path, base_prefix: str) -> str:
    rel = "/" + str(path.relative_to(root)).replace(os.sep, "/").lstrip("/")
    if path.is_dir() and not rel.endswith("/"):
        rel += "/"
    # prefix
    prefix = base_prefix.rstrip("/")
    if prefix:
        if not rel.startswith("/"):
            rel = "/" + rel
        return prefix + rel
    return rel

def guess_sha256_path(dir_path: Path, file_path: Path, root: Path, base_prefix: str) -> Optional[str]:
    # Option 1: per-file .sha256sum
    per_file = file_path.with_suffix(file_path.suffix + ".sha256sum")
    if per_file.exists():
        return rel_url(root, per_file, base_prefix)
    # Option 2: directory-level SHA256SUMS
    sums = dir_path / "SHA256SUMS"
    if sums.exists():
        return rel_url(root, sums, base_prefix)
    # Option 3: common "sha256sum.txt"
    sums2 = dir_path / "sha256sum.txt"
    if sums2.exists():
        return rel_url(root, sums2, base_prefix)
    return None

def build_dir_json(dir_path: Path, root: Path, base_prefix: str) -> Dict:
    # Path string with leading slash and trailing slash
    path_str = rel_url(root, dir_path, base_prefix)
    # Detect TLDR/README if present
    tldr = dir_path / "tldr.md"
    readme = dir_path / "README.md"
    tldr_url = rel_url(root, tldr, base_prefix) if tldr.exists() else None
    readme_url = rel_url(root, readme, base_prefix) if readme.exists() else None

    # Items: include files and subdirs (non-hidden)
    items: List[Dict] = []
    try:
        children = sorted([p for p in dir_path.iterdir() if not is_hidden(p.name)], key=lambda p: (p.is_file(), p.name))
    except FileNotFoundError:
        children = []

    for child in children:
        if child.name in {"dir.json", "manifest.json"}:
            continue
        if child.is_dir():
            items.append({
                "name": child.name + "/",
                "updated_at": iso8601(latest_mtime(child)),
                "href": rel_url(root, child, base_prefix),
                "dir": True
            })
        elif child.is_file():
            # file item
            item = {
                "name": child.name,
                "size": child.stat().st_size,
                "updated_at": iso8601(child.stat().st_mtime),
                "href": rel_url(root, child, base_prefix),
            }
            sha = guess_sha256_path(dir_path, child, root, base_prefix)
            if sha:
                item["sha256"] = sha
            items.append(item)

    payload = {
        "path": path_str,
        "updated_at": iso8601(latest_mtime(dir_path)),
        "items": items
    }
    if tldr_url:
        payload["tldr"] = tldr_url
    if readme_url:
        payload["readme"] = readme_url
    return payload

def top_level_roots(root: Path) -> List[Path]:
    # Consider top-level directories that are not hidden and not the UI output
    candidates: List[Path] = []
    for p in sorted(root.iterdir()):
        if not p.is_dir():
            continue
        if is_hidden(p.name):
            continue
        # common build dirs to skip (keep it conservative)
        if p.name in {"out", "ui", "node_modules"}:
            continue
        candidates.append(p)
    return candidates

def summarize_bucket(name: str) -> str:
    return SUMMARY_OVERRIDES.get(name, f"{name} artifacts")

def count_items_for_manifest(dir_path: Path) -> int:
    # Count immediate visible children (files + dirs), excluding metadata files
    try:
        children = [p for p in dir_path.iterdir()
                    if not is_hidden(p.name) and p.name not in {"manifest.json", "dir.json"}]
    except FileNotFoundError:
        return 0
    return len(children)

def write_json(path: Path, data: Dict):
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    tmp.replace(path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="Filesystem root of the mirror (e.g., /data/update-server)")
    ap.add_argument("--base-url-prefix", default="/", help="URL prefix (default '/')")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.exists():
        print(f"Root does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    # 1) Build dir.json for every directory
    for current_dir, subdirs, files in os.walk(root):
        dir_path = Path(current_dir)
        # Skip hidden dirs
        if is_hidden(dir_path.name) and dir_path != root:
            continue
        payload = build_dir_json(dir_path, root, args.base_url_prefix)
        out_path = dir_path / "dir.json"
        write_json(out_path, payload)
        if not args.quiet:
            print(f"Wrote {out_path}")

    # 2) Build manifest.json at root
    roots = top_level_roots(root)
    roots_payload = []
    for r in roots:
        href = rel_url(root, r, args.base_url_prefix)
        if not href.endswith("/"):
            href += "/"
        roots_payload.append({
            "name": r.name,
            "href": href,
            "updated_at": iso8601(latest_mtime(r)),
            "item_count": count_items_for_manifest(r),
            "summary": summarize_bucket(r.name),
        })

    manifest = {
        "generated_at": iso8601(datetime.now(timezone.utc).timestamp()),
        "roots": roots_payload
    }
    write_json(root / "manifest.json", manifest)
    if not args.quiet:
        print(f"Wrote {root / 'manifest.json'}")

if __name__ == "__main__":
    main()

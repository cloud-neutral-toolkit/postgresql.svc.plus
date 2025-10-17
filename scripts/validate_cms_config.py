#!/usr/bin/env python3
"""Validate the CMS configuration using the JSON schema."""

from __future__ import annotations

import json
import pathlib
import sys

try:
    import jsonschema
except ImportError as exc:  # pragma: no cover - handled in CI setup
    raise SystemExit(
        "jsonschema package is required to validate cms.json; install with 'pip install jsonschema'."
    ) from exc

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "cms.json"
SCHEMA_PATH = ROOT / "config" / "cms.schema.json"


def load_json(path: pathlib.Path) -> dict:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError as exc:
        raise SystemExit(f"Missing required file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Failed to parse {path}: {exc}") from exc


def main() -> int:
    schema = load_json(SCHEMA_PATH)
    config = load_json(CONFIG_PATH)

    try:
        jsonschema.validate(instance=config, schema=schema)
    except jsonschema.ValidationError as exc:
        location = " > ".join(str(item) for item in exc.absolute_path)
        message = f"cms.json validation error at {location or '<root>'}: {exc.message}"
        raise SystemExit(message) from exc

    print("cms.json matches cms.schema.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())

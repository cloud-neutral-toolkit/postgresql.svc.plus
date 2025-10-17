# Content Directory

This directory stores markdown-based content that can be rendered inside the XControl dashboard. Each markdown file **must** start with a YAML frontmatter block describing the document metadata followed by the document body.

## Frontmatter schema

```yaml
---
slug: "announcements/welcome"   # Optional. Defaults to the file path without the .md extension.
title: "Release Note Title"      # Required. Used as the document heading.
summary: "Short abstract."       # Optional. Appears beside the title and in previews.
version: "v1.0.0"                # Optional. Free-form version string for the document content.
updatedAt: "2025-02-03T09:00:00Z" # Optional ISO-8601 timestamp. Falls back to latest git commit time.
tags:                            # Optional list of labels.
  - docs
  - release
status: "published"             # Optional. Free-form status indicator (published, draft, etc.).
author: "Docs Team"             # Optional. Displayed in dashboards alongside version info.
links:                           # Optional. Additional related links rendered as reference list.
  - label: "Changelog"
    href: "https://example.com/changelog"
---
```

Additional custom keys are preserved and returned by the content API.

## Adding new documents

1. Create a markdown file anywhere under this directory (nested folders are allowed).
2. Populate the frontmatter according to the schema above.
3. Commit the file and run the dashboard to render it via the `/api/content/*` endpoints.

## Version history

The dashboard content API inspects the git history for each markdown file. Commit metadata is surfaced in the UI so contributors should continue to use Pull Requests and descriptive commit messages when updating content.

# svc.plus Frontend Routing Design

This document outlines the routing plan and page skeleton for the **svc.plus** site
implemented with **Next.js 14 App Router** and exported as static HTML (`output: 'export'`).
The site uses **TypeScript** and **Tailwind CSS**. All pages are statically generated at
build time; runtime servers are not required.

## Routes Overview

| Route | Description | Page File | Components | Data Source |
|-------|-------------|-----------|------------|-------------|
| `/` | Site home with entry cards to Downloads and Docs | `app/page.tsx` | custom `Card` components | static |
| `/download/` | Downloads home displaying top‑level folders | `app/download/page.tsx` | `CardGrid` | `dl.svc.plus` top‑level JSON fetched at build time |
| `/download/<name>/[...path]` | File listing for any nested folder | `app/download/[name]/[[...path]]/page.tsx` | `FileTable` | per‑folder JSON fetched at build time |
| `/docs/` | Docs home listing available ebooks | `app/docs/page.tsx` | optional `DocCard` grid | local `content/` processed by Contentlayer |
| `/docs/<name>` | Reading page for a single ebook | `app/docs/[name]/page.tsx` | reader layout with side TOC | `content/<name>/**` Markdown files |

## Directory Structure

```
app/
  page.tsx                     # Home
  download/
    page.tsx                   # Downloads home
    [name]/
      [[...path]]/
        page.tsx               # File listings for arbitrary depth
  docs/
    page.tsx                   # Docs home
    [name]/
      page.tsx                 # Ebook reader
content/                        # Markdown sources for docs
ui/
  dl/
    components/
      CardGrid.tsx
      FileTable.tsx
  docs/
    components/                # (optional) shared doc components
```

## Static Generation Requirements

### Downloads
1. `scripts/fetch-dl-index.ts` recursively crawls `https://dl.svc.plus/` (overridable by
   `DL_BASE`) and writes `public/dl-index/top.json` and `public/dl-index/all.json`.
   `top.json` feeds the downloads home while `all.json` contains a `DirListing[]` with
   every directory and its `DirEntry` children. The script runs automatically via the
   `prebuild` npm script.
2. `types/download.ts` defines shared types:
   ```ts
   interface DirEntry { name; href; type: 'file'|'dir'; size?; lastModified?; sha256? }
   interface DirListing { path; entries: DirEntry[] }
   ```
3. Use `all.json` to enumerate every `/<name>/path/...` combination.
4. Implement `generateStaticParams` in
   `app/download/[name]/[[...path]]/page.tsx` to return `{ name, path?: string[] }` for
   each known directory including the empty path.
5. Implement `generateMetadata` to set titles and OpenGraph info for each folder.
6. Render a `FileTable` with breadcrumb navigation and sorting by name/size/time.

### Docs
1. Store Markdown under `content/<doc>/<chapter>.md`.
2. Configure **Contentlayer** to parse metadata (title, cover, order, etc.).
3. `app/docs/page.tsx` queries the Contentlayer output to list available docs.
4. `app/docs/[name]/page.tsx` loads chapters for the given doc and renders a reader with
   a sidebar table of contents, progress indicator, and intra‑page anchors for navigation.
5. Implement `generateStaticParams` for `/docs/[name]` based on `allDocs` from
   Contentlayer, and `generateMetadata` for SEO and OpenGraph.

## CodeX Automation Prompt

Use the following step‑by‑step tasks for automated implementation.

1. **Initialize Next.js project**
   - Create a Next.js 14 project in `ui/` with `output: 'export'` and Tailwind CSS.
   - Acceptance: running `npm run build` produces static `out/` directory.

2. **Home Page**
   - Implement `app/page.tsx` with two cards linking to `/download/` and `/docs/`.
   - Acceptance: cards render with Tailwind styling.

3. **Downloads Sub‑site**
   - Add `CardGrid` and `FileTable` components under `ui/dl/components/`.
   - Use `types/download.ts` and run `pnpm prebuild` to fetch directory JSON during
     build. `CardGrid` props: `sections: { key; title; href; lastModified?; count? }[]`.
     `FileTable` props: `listing: DirListing`, `breadcrumb: { label; href }[]`.
   - Implement `generateStaticParams` and `generateMetadata` for
     `app/download/[name]/[[...path]]/page.tsx`.
   - Acceptance: visiting any known folder in exported build shows correct listing.

4. **Docs Sub‑site**
   - Configure Contentlayer for `content/` Markdown.
   - Create `app/docs/page.tsx` that lists docs and `app/docs/[name]/page.tsx` that renders
     a reader with sidebar TOC and navigation anchors.
   - Acceptance: static export contains pages for all docs with working navigation.

5. **Build Validation**
   - Run `pnpm i && pnpm build && pnpm export` to ensure a full static export.
   - Acceptance: the `out/` directory contains working `/download/` and `/docs/` pages,
     e.g. `/download/offline-package/k3s/` renders a file table and `/docs/<name>`
     retains reading progress.


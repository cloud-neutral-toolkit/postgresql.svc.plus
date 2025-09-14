# docs.svc.plus

Static documentation site built with Next.js, TailwindCSS and Contentlayer.

## Scripts
- `npm run build` – build static site
- `node scripts/import-from-chapters.js` – sync markdown from svc-design/documents

## Deployment
GitHub Actions builds the site, generates PDFs with pandoc/wkhtmltopdf and deploys via rsync. See `.github/workflows/build-deploy.yml`.

Nginx config: `nginx/docs.svc.plus.conf`

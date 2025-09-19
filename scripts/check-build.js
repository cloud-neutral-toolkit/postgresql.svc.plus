const fs = require('fs')
const path = require('path')

const HOMEPAGE_ROOT = path.resolve(__dirname, '..', 'ui', 'homepage')

function readJson(relativePath) {
  const fullPath = path.join(HOMEPAGE_ROOT, 'public', '_build', relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing build artifact: ${relativePath}`)
  }
  const raw = fs.readFileSync(fullPath, 'utf8')
  return JSON.parse(raw)
}

function ensureArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array`)
  }
  return value
}

function main() {
  const docsIndex = ensureArray(readJson('docs_index.json'), 'docs_index.json')
  if (docsIndex.length === 0) {
    throw new Error('docs_index.json is empty')
  }
  if (docsIndex.some((doc) => typeof doc.slug !== 'string' || !doc.slug)) {
    throw new Error('docs_index.json contains entries without slug')
  }

  const cloudIac = readJson('cloud_iac_index.json')
  const providers = ensureArray(cloudIac.providers, 'cloud_iac_index.providers')
  const services = ensureArray(cloudIac.services, 'cloud_iac_index.services')
  if (providers.length === 0) {
    throw new Error('cloud_iac_index.providers is empty')
  }
  if (services.length === 0) {
    throw new Error('cloud_iac_index.services is empty')
  }

  const docsPaths = ensureArray(readJson('docs_paths.json'), 'docs_paths.json')
  if (docsPaths.length === 0) {
    throw new Error('docs_paths.json is empty')
  }

  console.log('[check-build] All build artifacts look good.')
}

try {
  main()
} catch (error) {
  console.error('[check-build] validation failed:', error.message)
  process.exit(1)
}

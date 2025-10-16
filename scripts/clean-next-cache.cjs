const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const nextProjects = [path.join(projectRoot, 'ui', 'homepage')]

const devChunkMarkers = [
  'self.__next_require__.$Refresh',
  'self.$RefreshReg$',
  'self.$RefreshSig$',
  'RefreshRuntime',
  'webpackHotUpdate',
]

const devArtifacts = [
  path.join('static', 'development'),
  path.join('server', 'development'),
  path.join('static', 'chunks', 'development'),
]

const hasDevArtifacts = (nextDir) => {
  const webpackChunk = path.join(nextDir, 'static', 'chunks', 'webpack.js')
  if (fs.existsSync(webpackChunk)) {
    try {
      const content = fs.readFileSync(webpackChunk, 'utf8')
      if (devChunkMarkers.some((marker) => content.includes(marker))) {
        return true
      }
    } catch (error) {
      console.warn('[clean-next-cache] Failed to read webpack chunk:', error)
    }
  }

  return devArtifacts.some((relativePath) =>
    fs.existsSync(path.join(nextDir, relativePath)),
  )
}

for (const projectPath of nextProjects) {
  const nextDir = path.join(projectPath, '.next')
  if (!fs.existsSync(nextDir)) {
    continue
  }

  if (!hasDevArtifacts(nextDir)) {
    continue
  }

  try {
    fs.rmSync(nextDir, { recursive: true, force: true })
    console.info('[clean-next-cache] Removed stale Next.js cache at', nextDir)
  } catch (error) {
    console.error('[clean-next-cache] Failed to remove Next.js cache at', nextDir)
    throw error
  }
}

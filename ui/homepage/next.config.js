/**
 * 功能控制的树形结构，每个节点都可以通过 enabled 控制是否启用。
 * - children 支持精确路径、动态段([param])、以及通配符(*)。
 * - 当某个节点 enabled 为 false 时，其所有子级都会默认关闭。
 */
const featureToggles = {
  /**
   * 全局导航的功能开关，按需控制一级导航入口。
   */
  globalNavigation: {
    enabled: true,
    children: {
      docs: { enabled: true },
      demo: { enabled: true },
      download: { enabled: true },
      insight: { enabled: true },
      login: { enabled: true },
      register: { enabled: true },
      cloud_iac: { enabled: true },
      panel: { enabled: false },
    },
  },
  /**
   * 应用模块功能控制。支持到 URL 三层的逐级开关，如 /cloud_iac/[provider]/[service]。
   */
  appModules: {
    enabled: true,
    children: {
      cloud_iac: {
        enabled: true,
        children: {
          '[provider]': {
            enabled: true,
            children: {
              '[service]': { enabled: true },
            },
          },
          aliyun: {
            enabled: true,
            children: {
              ack: { enabled: true },
              'aliyun-emr': { enabled: false },
              '[service]': { enabled: true },
            },
          },
          aws: {
            enabled: true,
            children: {
              eks: { enabled: true },
              '[service]': { enabled: true },
            },
          },
        },
      },
      docs: { enabled: true },
      download: {
        enabled: true,
        children: {
          '[...segments]': { enabled: true },
        },
      },
      insight: { enabled: true },
      demo: { enabled: true },
    },
  },
}

const normalizeSegments = (pathname = '') =>
  pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)

const findDynamicChildKey = (children = {}) =>
  Object.keys(children).find((key) => /^\[(\.\.\.)?.+\]$/.test(key))

const resolveToggle = (node, segments) => {
  if (!node) return true
  const isEnabled = node.enabled !== false
  if (!isEnabled) return false
  if (!segments.length) return isEnabled

  const children = node.children || {}
  const [current, ...rest] = segments
  const exactChild = children[current]
  const dynamicChildKey = findDynamicChildKey(children)
  const wildcardChild = children['*']
  const nextNode =
    exactChild ?? (dynamicChildKey ? children[dynamicChildKey] : undefined) ?? wildcardChild

  if (!nextNode) return isEnabled
  return resolveToggle(nextNode, rest)
}

const isFeatureEnabled = (section, pathname) => {
  const tree = featureToggles[section]
  if (!tree) return true
  const segments = normalizeSegments(pathname)
  return resolveToggle(tree, segments)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 直接生成静态文件，便于部署到 S3 / Nginx
  trailingSlash: true,
  reactStrictMode: true,
  compress: false, // 压缩交给 Nginx，省 Node CPU
  images: { unoptimized: true }, // 关闭服务端图片处理
  featureToggles,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*', // 后端服务
      },
    ]
  },
  publicRuntimeConfig: {
    featureToggles,
  },
}

nextConfig.isFeatureEnabled = isFeatureEnabled

module.exports = nextConfig

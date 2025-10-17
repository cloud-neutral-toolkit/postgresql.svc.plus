# Register 页面 ChunkLoadError 调查

## 现象
- 浏览器访问 `https://www.svc.plus/register/` 时，会尝试加载 `/_next/static/chunks/1111.c6a4667178a4976d.js`。
- 该静态资源返回 `400 Bad Request`（在本地复现中表现为 404），导致浏览器抛出 `ChunkLoadError: Loading chunk 11 failed`，页面白屏。

## 根因分析
1. `app/register/page.tsx` 在最顶部声明了 `export const dynamic = 'error'`，这会强制 Next.js 在构建阶段对该路由执行静态生成（Static Generation）。【F:dashboard/app/register/page.tsx†L1-L21】
2. 对静态生成的 App Router 页面，Next.js 默认返回 `Cache-Control: s-maxage=31536000, stale-while-revalidate`。实际对 `/register/` 发起请求可看到这一响应头，意味着反向代理/CDN 会在 1 年内缓存页面 HTML。【313252†L1-L11】
3. 页面 HTML 中引用的 `_next/static/chunks/*` 文件名包含构建时生成的哈希值，每次重新部署都会发生变化。部署新版本时，旧版本构建产物中的 `1111.c6a4667178a4976d.js` 已被删除。针对该路径重新请求会直接返回 404（或被前置 OpenResty 拦截为 400）。【db9f28†L1-L11】
4. 由于缓存周期过长，CDN/反向代理仍在返回旧版本 HTML，客户端随之继续请求已经不存在的 chunk，从而触发 `ChunkLoadError`。

## 结论
Register 页面的白屏是由于 **旧版本 HTML 被缓存**，而对应的静态 chunk 在新版本部署后已不存在导致的。需要在部署后清理缓存，或者缩短/禁用对 `/register/` HTML 的缓存时间（例如改为 `revalidate = 0` 或 `dynamic = 'force-dynamic'`），以避免再次引用失效的 `_next/static/chunks/*` 文件。

## 修复建议
- **立即止血：发布后主动清理缓存**。在每次部署后，通过 OpenResty 后端的 `proxy_cache_purge` 或者 CDN 控制台对 `/register/` 页面执行缓存刷新，确保客户端拿到最新 HTML，避免继续引用已删除的 chunk。
- **降低 HTML 缓存时间**。若业务允许，可在 `app/register/page.tsx` 中改用 `export const revalidate = 0` 或 `dynamic = 'force-dynamic'`，让页面改为 SSR 或短周期再验证；也可在 Nginx/OpenResty 上为 `/register/` 设置较短的 `Cache-Control`，例如在 `homepage-dynamic.svc.plus.conf` 中单独匹配该路径并返回 `max-age=0`。
- **区分静态资源与页面缓存策略**。保留 `_next/static/*` 的长缓存，同时针对 HTML 页面（`/register/`）使用独立的缓存策略或禁用缓存，以防止 HTML 与静态资源版本错配。
- **建立回归监控**。为 `/register/` 页面添加可观测性指标（例如前端 Sentry 的 `ChunkLoadError` 告警），在未来版本不匹配时能第一时间发现并处理。

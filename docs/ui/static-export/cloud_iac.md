# Cloud IaC 静态化设计

## 页面范围
- `/cloud_iac`
- `/cloud_iac/[provider]`
- `/cloud_iac/[provider]/[service]`

## 数据来源
- `ui/homepage/lib/iac/catalog.ts` 提供所有 Provider 与服务分类。
- `public/_build/cloud_iac_index.json` 在构建前由 `scripts/export-slugs.ts` 导出 Provider / Service 组合。

## 静态导出策略
1. 在三个页面的模块顶端声明 `export const dynamic = 'error'`，禁止运行时回退到动态渲染。
2. 在 `/cloud_iac/[provider]` 与 `/cloud_iac/[provider]/[service]` 中实现 `generateStaticParams()`，从 `cloud_iac_index.json` 读取静态参数并导出 `dynamicParams = false`。
3. 使用 `cloud_iac_index.json` 与 `catalog.ts` 的静态常量渲染页面内容，避免请求数据库或外部 API。
4. 将任何 `generateMetadata` 的逻辑提前到模块作用域，生成一次性常量 `metadata`。

## 子任务拆分
- **数据导出**：在 `scripts/export-slugs.ts` 中读取 `catalog.ts`，生成 Provider 和 Service 对应的 JSON 列表。
- **页面改造**：为三个页面补充 `dynamic = 'error'` 与静态参数生成逻辑，更新到使用 JSON 数据。
- **校验**：在 `scripts/check-build.js` 中增加对 `cloud_iac_index.json` 的完整性检查，确保 Provider 与 Service 数量均大于 0。

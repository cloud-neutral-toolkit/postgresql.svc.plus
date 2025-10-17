# Docs 页面静态化设计

## 页面范围
- `/docs`
- `/docs/[name]`

## 数据来源
- Markdown 内容位于 `dashboard/cms/content/`，由 `scripts/scan-md.ts` 解析生成 `public/_build/docs_index.json`。
- 下载路径映射由 `public/_build/docs_paths.json` 提供。

## 静态导出策略
1. 将 `app/docs/page.tsx` 与 `app/docs/[name]/page.tsx` 顶部声明 `export const dynamic = 'error'`。
2. 使用 `generateStaticParams()` 从 `docs_index.json` 读取所有 `slug`，并导出 `dynamicParams = false`。
3. 在 `app/docs/resources.ts` 中移除运行时 `fetch`，改为读取静态 JSON 常量，确保构建期即可拿到完整数据。
4. 将原有 `generateMetadata` 动态逻辑转换为静态 `metadata` 常量。
5. 所有时间展示改用 `app/components/ClientTime.tsx`，并在父级标记 `suppressHydrationWarning`。

## 子任务拆分
- **数据脚本**：编写 `scripts/scan-md.ts` 解析 Markdown 并输出 `docs_index.json`、更新 `docs_paths.json`。
- **页面更新**：改造两个页面以消费静态 JSON，同时添加静态参数逻辑。
- **组件调整**：把 `formatDate` 等服务端时间处理迁移至客户端组件。
- **构建校验**：在 `scripts/check-build.js` 中验证 `docs_index.json` 至少包含一个条目，且字段完整。

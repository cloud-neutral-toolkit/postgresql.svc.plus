# Download 页面静态化设计

## 页面范围
- `/download`
- `/download/[...segments]`

## 数据来源
- `public/dl-index/all.json` 与 `manifest.json` 描述下载目录。
- `public/_build/docs_paths.json`（由 `scripts/export-slugs.ts` 写入）提供所有需要静态生成的路径。

## 静态导出策略
1. 在两个页面模块顶端添加 `export const dynamic = 'error'`，禁止运行时回退。
2. `/download/[...segments]` 使用 `generateStaticParams()` 从 `docs_paths.json` 读取路径列表并拆分为数组，导出 `dynamicParams = false`。
3. 在服务端组件内不直接调用 `new Date()`，改用字符串比较或 `Date.parse`；时间展示统一下沉到 `ClientTime` 客户端组件。
4. 404 分支保持不变，依旧在构建期根据静态数据输出。

## 子任务拆分
- **数据脚本**：在 `scripts/export-slugs.ts` 中收集下载目录路径并输出 `docs_paths.json`。
- **页面改造**：更新 `generateStaticParams()`、添加 `dynamicParams = false` 和时间处理逻辑。
- **组件调整**：在需要展示更新时间的位置引入 `ClientTime` 并加上 `suppressHydrationWarning`。
- **校验**：`scripts/check-build.js` 校验 `docs_paths.json` 非空且至少包含一级路径。

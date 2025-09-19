# Demo 页面静态化设计

## 页面范围
- `/demo`

## 数据来源
- `app/demo/feature.config.ts` 控制功能开关。
- `public/_build/cloud_iac_index.json` 不直接使用，但构建流程需要确保检查通过。

## 静态导出策略
1. 在 `app/demo/page.tsx` 开头声明 `export const dynamic = 'error'`，确保页面只能在构建期生成。
2. 页面仍通过 `feature.config` 判断开关，关闭时在构建期直接产出 404。
3. 保持现有 `DemoContent` 客户端组件逻辑不变。

## 子任务拆分
- **页面改造**：添加 `dynamic = 'error'` 常量。
- **构建校验**：在 `scripts/check-build.js` 中确认 Demo 所需的构建产物存在，避免缺失时继续构建。

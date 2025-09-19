# Login 页面静态化设计

## 页面范围
- `/login`

## 数据来源
- `app/login/feature.config.ts` 控制是否启用登录重定向。

## 静态导出策略
1. 在页面顶部加入 `export const dynamic = 'error'`，强制构建期生成。
2. 保持 `redirect('/panel/ldp')` 行为，构建时生成对 `/panel/ldp` 的静态跳转。
3. 若功能开关关闭，构建时产出 404。

## 子任务拆分
- **页面改造**：添加 `dynamic = 'error'`。
- **校验**：在 `scripts/check-build.js` 中验证登录功能开关开启时需要的静态页面全部存在，确保部署时不会缺失。

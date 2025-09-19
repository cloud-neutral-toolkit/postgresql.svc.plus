# Register 页面静态化设计

## 页面范围
- `/register`

## 数据来源
- `app/register/feature.config.ts` 用于控制是否开放注册入口。

## 静态导出策略
1. 在页面顶部添加 `export const dynamic = 'error'`。
2. 页面内容为静态卡片，保持 JSX 不变；关闭开关时在构建期直接产出 404。

## 子任务拆分
- **页面改造**：新增 `dynamic = 'error'`。
- **校验**：`scripts/check-build.js` 检测注册页面在开关开启时是否生成。

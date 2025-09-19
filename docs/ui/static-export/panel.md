# Panel 区域静态化设计

## 页面范围
- `/panel`
- `/panel/account`
- `/panel/agent`
- `/panel/xray`
- `/panel/subscription`
- `/panel/api`
- `/panel/ldp`

## 数据来源
- 静态展示内容，依赖组件位于 `app/panel/components/`。

## 静态导出策略
1. 在所有页面文件开头增加 `export const dynamic = 'error'`，替换现有 `force-static` 配置。
2. 所有文案均为静态字符串，无需额外数据源。
3. 保留现有的卡片组件布局，确保与动态版本一致。

## 子任务拆分
- **页面改造**：为 7 个页面文件添加/替换 `dynamic = 'error'`。
- **脚本校验**：`scripts/check-build.js` 校验输出目录中存在 `/panel` 相关静态文件。

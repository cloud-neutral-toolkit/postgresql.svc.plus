# 多租户适配与权限角色规划检查报告

## 概览

本次检查聚焦于前后端在多租户环境下的适配度与角色权限控制实现。后端账户服务的数据模型已包含 `role`、`groups`、`permissions` 字段，可支撑细粒度的访问控制，并且前端会话 API 现已补充 `tenantId` 与 `tenants` 元数据，便于后续按照租户维度做隔离控制。【F:account/sql/schema.sql†L27-L67】【F:dashboard/app/api/auth/session/route.ts†L12-L116】

前端 `userStore` 会解析并缓存上述字段，同时归一化多租户信息，为 React 组件提供统一上下文；新增的 `accessControl` 工具封装了访问信息判定逻辑，使页面与组件能够以声明式的方式定义访问规则。面向用户的首页、Docs 与下载中心保持公开访问，而 `/panel` 下页面默认要求登录，`/panel/management` 进一步限制为管理员与操作员角色访问。【F:dashboard/lib/userStore.tsx†L1-L161】【F:dashboard/lib/accessControl.ts†L1-L99】【F:dashboard/app/page.tsx†L1-L28】【F:dashboard/app/panel/layout.tsx†L1-L115】

此外，轻量级 IDP 组件已经具备 `TENANT` 配置项，可与前端新增的租户字段对接，实现多租户身份源隔离。【F:light-idp/idp-server/internal/config/config.go†L1-L36】

## 角色权限规划

| 角色 | 访问范围 | 备注 |
| ---- | -------- | ---- |
| 超级管理员（admin） | 拥有全部模块访问权限，包括管理面板、权限矩阵编辑、用户角色调整等操作。 | 导航栏会额外展示“Management Console”入口。 | 
| 操作员（operator） | 与管理员共享管理面板视图，但仅具备运营授权范围内的只读/执行权限。 | 可访问 `/panel/management`，但无法执行管理员专属操作。 |
| 普通用户（user） | 需登录后方可进入 `/panel`，默认仅开放 `/panel/account` 个人中心与 MFA 设置。 | | 
| 访客（guest） | 无需登录即可浏览首页、Docs、下载中心以及 Ask AI 入口。 | Ask AI 组件默认允许访客使用，但支持后续通过权限规则关闭。 |

### 控制点落地

- **路由守卫**：`PanelLayout` 在客户端根据路由前缀与访问规则执行跳转，未登录用户统一重定向到 `/login`，无权限用户重定向回 `/panel`。（`/panel/account` 在登录后始终可达）【F:dashboard/app/panel/layout.tsx†L21-L104】
- **组件能力**：`Navbar` 会根据用户角色动态显示“Management Console”菜单项；`AskAIButton` 使用 `useAccess` Hook 实现可配置的权限判定，并保持默认公开访问策略。【F:dashboard/components/Navbar.tsx†L1-L228】【F:dashboard/components/AskAIButton.tsx†L1-L41】
- **管理页面**：`/panel/management` 在页面层面复用统一的 `resolveAccess` 判定，能够对未登录与越权场景给出不同提示，同时只对管理员角色开放权限矩阵写入操作。【F:dashboard/app/panel/management/page.tsx†L1-L235】

## 后续建议

1. **租户切换能力**：后端会话响应已带上 `tenants` 列表，可以在前端补充租户选择器，并将租户上下文透传给 API 请求，实现真正的多租户隔离。
2. **权限矩阵配置化**：结合 `accessControl`，可以将模块到角色/权限的映射抽取到配置文件，便于在不改代码的情况下调整授权策略。
3. **审计与日志**：为关键管理操作增加审计记录，与租户信息绑定，确保满足企业级多租户合规要求。

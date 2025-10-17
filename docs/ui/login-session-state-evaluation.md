# 登录态保持方案评估：SWR + Zustand 组合

## 背景
当前首页应用在完成账号登录后，需要在多个页面和组件之间共享用户会话信息。如果仅依赖页面局部的 `useState` 或基于路由的服务器渲染数据，容易出现以下问题：

- 页面刷新或路由切换时用户信息丢失，需要重新请求或依赖 URL 参数。
- 跨组件访问用户数据时需要层层透传 props，维护成本高。
- 登录或注销动作完成后，无法及时通知其它组件更新 UI。

因此，需要一个能够缓存用户会话信息并支持跨组件订阅更新的客户端状态方案。

## 推荐方案：SWR 负责数据获取 + Zustand 负责缓存
结合数据获取库 [SWR](https://swr.vercel.app/) 和轻量级状态管理库 [Zustand](https://zustand-demo.pmnd.rs/) 可以解决上述痛点：

1. **SWR 持久化获取登录态**：
   - 通过 `useSWR` 以 `/api/auth/session` 为数据源拉取当前登录用户信息。
   - 内置请求缓存、请求合并、焦点重新验证等能力，避免重复请求。
   - 统一处理 `fetch` 错误，确保异常情况下回退为匿名用户。

2. **Zustand 提供全局缓存与订阅**：
   - 使用 `create` 创建 `sessionStore`，保存当前 `user` 对象及 `setUser` 更新方法。
   - 任意组件可通过自定义 hook 订阅所需切片，避免 Context 重渲染开销。
   - 当 `SWR` 数据变更时，通过 `setUser` 写入 store，从而驱动 UI 更新。

3. **登录 / 注销流程统一**：
   - 登录成功后调用 `mutate()` 重新验证 session 并更新 `user`。
   - 注销时清理服务器 session，再执行刷新逻辑，使所有订阅者同步为匿名态。

## 实现概览
项目已经在 `dashboard/lib/userStore.tsx` 中实现了上述组合：

- 定义 `SESSION_CACHE_KEY` 和 `fetchSessionUser()`，统一 session 拉取逻辑。
- 通过 `useSWR` 获取 `data`、`isLoading`、`mutate`，并关闭聚焦重新验证以减少闪烁。
- 使用 `useEffect` 在 `SWR` 数据变化时写入 Zustand store。
- 对外暴露 `UserProvider` 和 `useUser()`，供页面和组件消费登录态。【F:dashboard/lib/userStore.tsx†L1-L143】

在登录表单中，成功提交后执行 `await login()`（内部调用 `mutate()`），随后刷新路由即可看到用户个性化信息。【F:dashboard/app/login/LoginForm.tsx†L1-L104】

## 预期收益
- **可靠的登录态保持**：刷新或跨页面访问时直接从 SWR 缓存中读取，无需二次登录。
- **更好的用户体验**：导航栏、表单等组件即时获得更新，无需手动通知。
- **扩展性**：后续若要增加多种角色、权限标识，只需在 `User` 类型中扩展字段，并在 `fetchSessionUser` 中统一处理。
- **易于测试**：Zustand store 支持在测试环境注入初始状态，方便模拟已登录/未登录场景。

## 可能的注意事项
- 需确保 `/api/auth/session` 在登录后返回正确的用户对象，否则客户端只会得到 `null`。
- 如果存在多标签页同步需求，可以结合 `SWR` 的 `broadcastCache` 或浏览器 `storage` 事件实现额外同步。
- 在严格的安全场景下，应避免在客户端存储敏感信息，保持用户对象最小化。

## 结论
相较于单纯依赖 Context 或手工管理请求，SWR + Zustand 的组合能够以较小的改动提供稳定的登录态缓存能力，适合继续沿用并在更多页面推广。如需进一步优化，可考虑封装更多用户行为（如刷新 token、权限校验）到同一 store，实现统一的认证状态管理。

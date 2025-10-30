# Cloud-Neutral 子域统一命名迁移规划

## 1. 背景与目标
现有 Cloud-Neutral 生态的各子系统分别部署在 `svc.plus` 旗下的多个子域中，例如账号中心使用 `accounts.svc.plus`，控制台与公共站点共用 `www.svc.plus`，API 入口映射到 `rag-server.svc.plus` 等配置文件仍保留旧命名。【F:account/config/account.yaml†L10-L23】【F:dashboard/config/runtime-service-config.yaml†L1-L27】【F:deploy/openresty/rag-server.svc.plus.conf†L1-L69】

为降低证书、路由和跨域配置的复杂度，计划按照统一命名体系：

| 模块 | 新域名 | 说明 |
| --- | --- | --- |
| 用户中心 | `accounts.svc.plus` | 负责 SSO、注册与 OAuth 流程 |
| 控制台 | `console.svc.plus` | XControl Web 控制台 + 后端 API；`www.svc.plus` 作为统一外显入口，反向代理到 `console.svc.plus` 并依据登录角色（访客、客户成功、合作伙伴等）呈现差异化模块 |
| 观测系统 | `xscope.svc.plus` | XScopeHub 与监控、日志可观测组件 |
| 云编排 | `xcloudflow.svc.plus` | XCloudFlow 及 Pulumi/Terraform 编排入口 |
| 实时协作 | `xstream.svc.plus` | XStream/XAgent 协同能力与流式推理工作台 |
| 下载中心 | `dl.svc.plus` | 产品离线包与镜像分发 |
| API 网关 | `api.svc.plus` | 统一 OpenResty 入口、向后端服务反向代理 |

上述命名覆盖 Cloud-Neutral 旗下四个开源产品专题站：`console.svc.plus`（XControl）、`xscope.svc.plus`（XScopeHub）、`xcloudflow.svc.plus`（XCloudFlow）与 `xstream.svc.plus`（XStream/XAgent），确保每个产品拥有独立的域名与部署流水线，同时由 `www.svc.plus` 作为公共入口聚合与分发不同角色的访问流量。

本规划目标：

1. 梳理仓库内涉及域名引用的代码、配置和文档；
2. 分阶段制定迁移步骤，确保最小停机并支持灰度；
3. 明确回滚方案与测试覆盖，降低切换风险。

## 2. 现状盘点

### 2.1 用户中心（accounts.svc.plus）
- Go 账号服务 `account/` 通过 `server.publicUrl` 指向 `https://accounts.svc.plus` 并在 `allowedOrigins` 中列出旧前端域名列表。【F:account/config/account.yaml†L6-L23】
- 多份文档（例如 `docs/account-svc-plus.md`、`docs/account-xstream-desktop-integration.md`）阐述账号服务部署契约，需要同步调整对控制台和下载域的描述。【F:docs/account-svc-plus.md†L1-L37】【F:docs/account-xstream-desktop-integration.md†L1-L52】

### 2.2 控制台（console.svc.plus）
- Next.js 前端配置默认 `serverService.baseUrl` 为 `https://api.svc.plus`，并在 `serviceConfig` 中内建相同默认值；需切换到 `console.svc.plus`。【F:dashboard/config/runtime-service-config.yaml†L1-L27】【F:dashboard/lib/serviceConfig.ts†L63-L90】
- RAG/后端服务公开地址为 `https://api.svc.plus`，与控制台共用域；迁移后应拆分出 `console.svc.plus` 并保留 API 网关代理。【F:rag-server/config/server.yaml†L1-L13】

### 2.3 观测系统（xscope.svc.plus）
- 监控部署脚本默认 `grafana.svc.plus`、`metrics.svc.plus`，需统一到新的 `xscope.svc.plus` 子域并保留二级路径区分子系统。【F:docs/install_tiny_monitor_server.sh†L14-L228】【F:docs/observability-plan.md†L1-L33】

### 2.4 云编排（xcloudflow.svc.plus）
- 编排与工作流相关内容主要分布在 `workflows/` 目录以及 `docs/` 下的架构说明。需确认 CLI、API 以及前端中是否出现旧域名引用，确保 XCloudFlow 入口指向 `xcloudflow.svc.plus`。【F:workflows/global-homepage.onwalk.net†L5-L15】【F:docs/overview.md†L1-L120】

### 2.5 实时协作（xstream.svc.plus）
- `docs/account-xstream-desktop-integration.md` 与 `docs/account-svc-plus.md` 中记录了 XStream 桌面端的登录跳转，需新增 `xstream.svc.plus` 作为产品专题站点，确保 OAuth 回调链路指向 `accounts.svc.plus`。【F:docs/account-svc-plus.md†L1-L37】【F:docs/account-xstream-desktop-integration.md†L1-L52】

### 2.6 下载中心（dl.svc.plus）
- 离线包抓取脚本 `scripts/fetch-dl-index.ts` 默认访问 `https://dl.svc.plus/`，需验证目录结构与 CDN 缓存策略是否受新证书影响。【F:scripts/fetch-dl-index.ts†L1-L43】
- 控制台下载组件将制品域固定为 `https://artifact.svc.plus`，迁移后需要考虑统一到 `dl.svc.plus` 或通过 API 网关映射。【F:dashboard/components/DownloadSection.tsx†L5-L55】

### 2.7 API 网关（api.svc.plus）
- OpenResty 配置 `rag-server.svc.plus.conf` 同时服务 `rag-server.svc.plus` 与 `api.svc.plus`，迁移后应把核心入口集中到 `api.svc.plus` 并让内部服务使用专属子域；同时更新其它 nginx 站点配置以引用统一证书目录。【F:deploy/openresty/rag-server.svc.plus.conf†L1-L69】

## 3. 迁移策略

### 阶段 A：基础设施准备
1. **DNS 与证书**：为 `console.svc.plus`、`xscope.svc.plus`、`xcloudflow.svc.plus`、`xstream.svc.plus` 以及公共入口 `www.svc.plus` 申请 DNS 记录与证书，确认证书 SAN 覆盖所有新子域。若沿用通配符证书，更新生成脚本确保包含新域名。【F:scripts/generate-postgres-tls.sh†L5-L102】
2. **网关路由**：在 OpenResty / Nginx 上新增虚拟主机监听新域，保持回源 IP 与端口不变，阶段性与旧域名并行。
3. **监控系统**：先行部署 `xscope.svc.plus` 域名，更新 Prometheus/Grafana OIDC 配置以适配 `accounts.svc.plus` 回调地址。

### 阶段 B：代码与配置切换
1. **账号服务**：
   - 更新 `server.allowedOrigins`，替换旧的 `www.svc.plus` 引用为 `console.svc.plus`。
   - 调整文档与示例配置，说明新的控制台入口和 OAuth 回调域。
   - 通过环境变量允许旧域名白名单保留一段时间，以便客户端缓存刷新。
2. **控制台前端**：
   - 更新 `dashboard/config/runtime-service-config.yaml` 的 `serverService.baseUrl`，同时在 `serviceConfig.ts` 中修改默认常量，确保 SSR、客户端与 API 调度指向 `https://console.svc.plus`；保留 `www.svc.plus` 作为统一入口的反向代理域，并在部署说明中强调按角色渲染不同模块。
   - 梳理前端中硬编码的下载与 API 域名，改为引用配置中心或常量文件，支持 `dl.svc.plus` 与 `api.svc.plus`。
   - 对 `NEXT_PUBLIC_*` 环境变量增加新域说明，更新 `README` 与部署脚本。
3. **后端 API（rag-server）**：
   - 更新 `config/server.yaml` 的 `server.publicUrl` 与 `allowedOrigins`，拆分管理端和公共站点的跨域策略。
   - 修改 OpenResty `rag-server.svc.plus.conf`，将 443 监听的主要 `server_name` 切换为 `api.svc.plus`，并为 `console.svc.plus` 引入专门的 upstream 规则（或将其代理到 `api` 路径）。
4. **观测系统**：
   - 调整 `docs/install_tiny_monitor_server.sh` 等脚本，默认域名改为 `xscope.svc.plus`，并更新 `docs/observability-plan.md` 描述。
   - 迁移 Grafana / Prometheus URL，校正 OAuth client redirect URL。
5. **云编排入口**：
   - 为 `workflows/`、`docs/` 中引用的旧域名增加 TODO 标记，计划在后端 API 与 CLI 中提供 `xcloudflow.svc.plus` 常量，供未来开发使用。
   - 若 Pulumi/CLI 有配置文件，新增 `FLOW_SERVICE_BASE_URL` 支持。
6. **实时协作**：
   - 在桌面端、Agent 与协作工具文档中统一 `xstream.svc.plus` 入口，将登录跳转默认指向 `accounts.svc.plus`。
   - 校验反向代理规则，确保 `xstream` 相关实时流式接口走 `api.svc.plus` 下游服务并具备降级回滚策略。
7. **下载中心**：
   - 将下载脚本与前端组件中的 `artifact.svc.plus` 替换为 `dl.svc.plus`（或通过配置切换），同时校验 CDN cache key。
   - 更新 `docs/Frontend-Routing-design.md` 中关于下载路由与 manifest 的说明。

### 阶段 C：灰度与切流
1. **双域并行**：在 1~2 个冲刺周期内同时保留旧域名，通过 HTTP 301 引导新域，以便缓存刷新。
2. **监控验证**：使用 `xscope.svc.plus` 上线后观察 API 网关、账号服务请求量，确认跨域头部、OAuth 流程正常。
3. **客户端更新**：通知桌面、CLI、移动端将默认 API 域改为 `api.svc.plus`，并提供回退参数。

### 阶段 D：收尾与回滚
1. **文档清理**：全面搜索 `svc.plus` 旧子域，确认只在历史记录或兼容性说明中保留，并注明已弃用。
2. **证书与 DNS 清理**：保留 `www.svc.plus` 作为统一入口，确保其反向代理规则与 `console.svc.plus` 同步更新；同时撤销不再使用的旧专题域名绑定。
3. **回滚策略**：保留旧配置备份，若迁移后 30 分钟内出现大面积失败，可通过 DNS 切换与还原配置文件恢复旧域。

## 4. 验证与测试
- **单元/集成测试**：确保 `account`, `rag-server` 在更新 `publicUrl` 后通过现有测试；必要时新增针对 `publicUrl` 的断言。
- **E2E**：执行控制台登录、配置、下载流程，验证跨域和 Cookie 写入是否依赖旧域名。
- **监控告警**：在 `xscope.svc.plus` 上添加 5xx、OAuth 失败、证书即将过期等告警规则，保障迁移期间快速响应。

## 5. 风险与缓解
- **缓存/证书传播延迟**：提前 24h 刷新 CDN/浏览器缓存，提供 `cache-busting` 机制。
- **跨域策略遗漏**：在 `allowedOrigins` 中提供回退通配符或灰度参数，并记录部署脚本执行顺序。
- **第三方回调**：检查 GitHub OAuth、SSO 等第三方回调 URL，提前在平台后台登记新域。

---
> 本计划会随实施进展更新，建议在每次发布后同步回填执行结果与遗留问题。

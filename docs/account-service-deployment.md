# Account Service 部署指南

本文档介绍如何在不同环境中部署 XControl 账号服务，包括本地开发、容器化以及生产环境的关键注意事项。

## 1. 运行时依赖

- Go 1.22 及以上版本，用于编译服务。
- （可选）PostgreSQL、Redis 等外部组件，当前实现默认使用内存存储，可在后续扩展中替换。
- Make 与 Git（可选），用于辅助构建与版本管理。

## 2. 本地开发部署

1. **拉取代码**
   ```bash
   git clone <repo-url>
   cd XControl
   ```

2. **启动服务**
   ```bash
   go run ./account/cmd/accountsvc
   ```
   默认监听 `:8080`，可通过 `curl http://127.0.0.1:8080/healthz` 检查服务状态。

3. **交互测试**
   - 注册账号：
     ```bash
     curl -X POST http://127.0.0.1:8080/v1/register \
       -H 'Content-Type: application/json' \
       -d '{"name":"demo","email":"demo@example.com","password":"Secret123"}'
     ```
   - 登录获取 token：
     ```bash
     curl -X POST http://127.0.0.1:8080/v1/login \
       -H 'Content-Type: application/json' \
       -d '{"email":"demo@example.com","password":"Secret123"}'
     ```

## 3. Docker 镜像部署

1. **构建镜像（示例 Dockerfile 需后续补充）**
   ```bash
   docker build -t xcontrol/account-service -f deploy/account/Dockerfile .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     --name account-service \
     -p 8080:8080 \
     xcontrol/account-service
   ```

3. **查看日志**
   ```bash
   docker logs -f account-service
   ```

若需与 PostgreSQL、Redis 集成，可通过环境变量或配置文件挂载方式将连接信息传入容器。

## 4. Kubernetes/Helm 部署（建议）

- 在 `deploy/account` 目录中维护 Helm Chart 或 Kustomize 模板，定义 Service、Deployment、ConfigMap 等资源。
- 关键参数：
  - 副本数 `replicaCount`，生产环境建议至少 2 个副本以实现高可用。
  - 探针：配置 `livenessProbe` 与 `readinessProbe` 指向 `/healthz`。
  - 资源限制：根据用户规模设置 CPU/内存请求与限制。
  - Secret 管理：通过 Kubernetes Secret 注入数据库、缓存或第三方身份源的凭据。

## 5. 灰度与回滚策略

- 采用 RollingUpdate 策略滚动发布，确保新旧副本并行运行。
- 配置 `maxUnavailable=0`、`maxSurge=1`（或按需调整），避免服务中断。
- 通过标记镜像版本或 Git Commit Hash 追踪上线版本，出问题时可快速回滚至上一版本。

## 6. 监控与日志

- 日志：默认输出到标准输出，可挂载至日志采集系统（如 Loki、ELK）。
- 指标：后续可集成 Prometheus 指标暴露，便于观察登录成功率、请求延迟、会话数量等关键指标。
- 告警：基于探针失败、登录失败率飙升、token 生成错误等指标配置告警。

## 7. 安全加固建议

- 在容器或集群层启用网络策略，仅开放必要端口。
- 配置 HTTPS/TLS 网关，保证传输安全。
- 对外部依赖（数据库、缓存）使用专用账号与最小权限策略。
- 部署前进行漏洞扫描与依赖安全检查。

---
以上步骤仅覆盖核心流程，实际生产部署需根据企业环境补充网络、合规等细节。

# Account Service 部署指南

本文档介绍如何在不同环境中部署 XControl 账号服务，包括本地开发、容器化以及生产环境的关键注意事项。

## 1. 运行时依赖

- Go 1.22 及以上版本，用于编译和运行服务。
- PostgreSQL（推荐）或内存存储：MFA 状态、TOTP 秘钥等信息会持久化在用户表中，生产环境请使用数据库。
- （可选）反向代理或负载均衡器，用于在 TLS 终止后分发流量。

## 2. 本地开发部署

1. **拉取代码**
   ```bash
   git clone <repo-url>
   cd XControl
   ```

2. **准备配置**
   使用仓库提供的 `account/config/account.yaml`，或根据需要拷贝一份修改端口、数据库连接等字段。

3. **启动服务（HTTP）**
   ```bash
   go run ./account/cmd/accountsvc --config account/config/account.yaml
   ```
   默认监听 `:8080`，可通过 `curl http://127.0.0.1:8080/healthz` 检查服务状态。

4. **交互测试：注册、绑定 MFA 与登录**

   ```bash
   # 注册账号
   curl -X POST http://127.0.0.1:8080/api/auth/register \
     -H 'Content-Type: application/json' \
     -d '{"name":"demo","email":"demo@example.com","password":"Secret123"}'

   # 初次登录以获取 MFA 挑战 token（返回 401，并携带 mfaToken）
   curl -X POST http://127.0.0.1:8080/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"identifier":"demo@example.com","password":"Secret123"}'

   # 请求 TOTP 秘钥（返回二维码和 Base32 密钥）
   curl -X POST http://127.0.0.1:8080/api/auth/mfa/totp/provision \
     -H 'Content-Type: application/json' \
     -d '{"token":"<MFA_TOKEN_FROM_LOGIN>"}'

   # 使用 oathtool 或 Google Authenticator 生成一次性验证码
   oathtool --totp -b <BASE32_SECRET>

   # 验证并启用 MFA（首次会返回会话 token）
   curl -X POST http://127.0.0.1:8080/api/auth/mfa/totp/verify \
     -H 'Content-Type: application/json' \
     -d '{"token":"<MFA_TOKEN_FROM_LOGIN>","code":"123456"}'

   # 带口令 + TOTP 登录
   curl -X POST http://127.0.0.1:8080/api/auth/login \
     -H 'Content-Type: application/json' \
     -c cookies.txt \
     -d '{"identifier":"demo@example.com","password":"Secret123","totpCode":"123456"}'

   # 或使用邮箱 + TOTP 极简模式
   curl -X POST http://127.0.0.1:8080/api/auth/login \
     -H 'Content-Type: application/json' \
     -c cookies.txt \
     -d '{"identifier":"demo@example.com","totpCode":"123456"}'

   # 查看当前会话
   curl -b cookies.txt http://127.0.0.1:8080/api/auth/session
   ```

   若需要重新绑定 MFA，可再次发起登录以获取新的 `mfaToken`，然后重复 `provision` → `verify` 流程；如需彻底重置，可在数据库中清理相关 MFA 字段后重新执行上述步骤。

   > 时间同步提示：TOTP 验证允许 ±1 个 30 秒时间片的偏移，但依赖服务器与客户端时钟保持一致。请在部署环境中启用 NTP/Chrony 等服务，并注意 `mfaToken` 默认 10 分钟后失效。

## 3. 启用 HTTPS/TLS

账号服务内置 TLS 支持，只要在配置文件中提供证书即可：

```yaml
 server:
  addr: ":8443"
  tls:
    enabled: true
    certFile: "/etc/ssl/certs/account.pem"
    keyFile: "/etc/ssl/private/account.key"
    clientCAFile: "" # （可选）配置客户端证书验证
    redirectHttp: true
```

启动命令保持不变：

```bash
go run ./account/cmd/accountsvc --config /path/to/secure-account.yaml
```

常见验证步骤：

```bash
# 生成测试证书（示例）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout account.key -out account.crt \
  -subj "/CN=localhost"

# 更新配置后启动服务
ACCOUNT_CONFIG=/tmp/account-secure.yaml go run ./account/cmd/accountsvc --config $ACCOUNT_CONFIG

# 使用 curl 验证 HTTPS（开发环境可加 -k 跳过校验）
curl -k https://127.0.0.1:8443/healthz
```

当 `redirectHttp` 为 `true` 时，服务会自动监听对应的 HTTP 端口（通常是 80），并将请求 301 重定向到 HTTPS，方便旧链接或未更新的客户端。
如需启用双向 TLS，可将 `clientCAFile` 指向受信任的 CA 证书，服务会校验客户端证书并拒绝未签发的连接。

> **反向代理提示**：若在 Nginx、Envoy 等反向代理后运行账号服务，可选择在代理层终止 TLS，并将 `server.tls` 字段留空。此时应确保代理转发 `X-Forwarded-Proto`/`X-Forwarded-Host` 等头部，以便后端生成正确回调地址。若代理和服务都启用了 HTTPS，则保持 `redirectHttp=false`，避免出现重复重定向。

## 4. Docker 部署

1. **构建镜像（示例）**
   ```bash
   docker build -t xcontrol/account-service -f deploy/account/Dockerfile .
   ```

2. **运行容器（挂载配置与证书）**
   ```bash
   docker run -d \
     --name account-service \
     -p 8443:8443 \
     -p 8080:8080 \
     -v $(pwd)/account.yaml:/etc/xcontrol/account.yaml \
     -v $(pwd)/certs:/etc/ssl/xcontrol \
     xcontrol/account-service \
     --config /etc/xcontrol/account.yaml
   ```

   如果未启用 `redirectHttp`，可省略 `-p 8080:8080`。

3. **查看日志**
   ```bash
   docker logs -f account-service
   ```

确保容器内路径与配置文件中的 `certFile`/`keyFile` 一致，必要时可通过 Docker Secret 或 Kubernetes Secret 注入敏感文件。

## 5. Kubernetes/Helm 部署

- 在 `deploy/account` 目录中维护 Helm Chart 或 Kustomize 模板，定义 Service、Deployment、ConfigMap 等资源。
- 关键参数：
  - 副本数 `replicaCount`，生产环境建议至少 2 个副本以实现高可用。
  - 探针：配置 `livenessProbe` 与 `readinessProbe` 指向 `/healthz`。
  - 证书管理：使用 Secret 存储 TLS 证书与私钥，挂载到容器后与配置文件对应。
  - 数据库凭证：同样通过 Secret 注入 `ACCOUNT_STORE_DSN` 或配置文件。

## 6. 灰度与回滚策略

- 建议采用 RollingUpdate 策略滚动发布，确保新旧副本并行运行。
- 配置 `maxUnavailable=0`、`maxSurge=1`（或按需调整），避免服务中断。
- 通过标记镜像版本或 Git Commit Hash 追踪上线版本，出问题时可快速回滚至上一版本。

## 7. 监控与日志

- 日志：默认输出到标准输出，可挂载至日志采集系统（如 Loki、ELK）。
- 指标：可在后续版本中集成 Prometheus 指标，关注登录成功率、MFA 启用率等核心指标。
- 告警：基于探针失败、登录失败率飙升、TOTP 验证异常等指标配置告警策略。

## 8. 安全加固建议

- 在容器或集群层启用网络策略，仅开放必要端口。
- 对外提供服务时务必启用 HTTPS，保护登录口令与 TOTP 码。
- 对数据库、证书等敏感资源使用最小权限原则，并定期轮换。
- 定期回顾 `account/api/api_test.go` 中的场景测试，确保关键登录链路持续可用。

---
以上步骤覆盖从开发到生产的核心流程，可根据企业环境补充额外的安全、审计或合规要求。

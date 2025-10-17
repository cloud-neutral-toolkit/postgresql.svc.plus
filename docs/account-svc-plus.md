# account.svc.plus 设计文档

本文档基于现有项目结构，描述一个轻量级的账号服务 **account.svc.plus** 的设计方案。

## 1. 功能概述

- 提供统一的用户身份认证与授权接口。
- 支持企业常用的三种协议：LDAP、OIDC、SAML2.0。
- 采用 PostgreSQL 作为持久化存储，Redis 作为缓存与会话存储。
- 以 Go 语言实现，延续项目中 `gin` 框架的使用，确保高并发与安全性。
- 预留模块化扩展能力，方便未来接入更多身份源或业务逻辑。

## 2. 总体架构

```
+---------------+         +------------------+
| LDAP / OIDC / |  Auth   |   account.svc    |
|    SAML IdP   +-------->+------------------+-----> PostgreSQL
+---------------+         |   REST / gRPC    |
                           |   gin + goroutine|
                           +------------------+-----> Redis
```

服务以 `cmd/accountsvc/main.go` 作为入口，内部划分如下模块：

- `internal/auth`: 封装 LDAP、OIDC、SAML2.0 适配器，统一认证接口。
- `internal/store`: 使用 `pgx` 连接 PostgreSQL，定义用户、会话、绑定等模型。
- `internal/cache`: 基于 `go-redis` 实现 token、会话的缓存与黑名单。
- `api`: 提供 `/login`、`/logout`、`/userinfo` 等 REST 接口，可按需扩展 gRPC。
- `config`: 参照 `rag-server/config` 风格，提供 YAML/ENV 配置解析。

## 3. 协议支持

### 3.1 LDAP
- 使用 `github.com/go-ldap/ldap`，支持绑定验证和属性同步。
- 可配置多个 LDAP 服务器与搜索基准，具备 failover 能力。

### 3.2 OIDC
- 基于 `github.com/coreos/go-oidc` 实现授权码流程。
- 通过 JWT 校验、State/Nonce 防重放，结合 Redis 存储 session。

### 3.3 SAML2.0
- 使用 `github.com/crewjam/saml` 适配 SAML 认证。
- 支持元数据导入和签名校验，回调地址与证书在配置中管理。

各协议通过 `internal/auth` 中的接口抽象统一输出用户信息，便于后续扩展更多身份源。

## 4. 数据与缓存

- **PostgreSQL**：
  - 表结构包括 `users`、`identities`、`sessions` 等。
  - 使用 `pgxpool` 管理连接池，利用事务保障一致性。
- **Redis**：
  - 保存登录 session、验证码、临时 token。
  - 设置合理的过期策略并启用哨兵或集群模式提高可用性。

### 4.1 表结构草案

`account/sql/schema.sql` 维护初始建表脚本：

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS identities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    external_id TEXT NOT NULL,
    UNIQUE(provider, external_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
```

## 5. 高并发与安全

- `gin` 提供高性能路由与中间件机制，结合 `goroutine` 实现并发处理。
- 使用 `net/http` 标准库的 `http.Server` 配置 `Read/Write/Idle Timeout`，防止慢连接攻击。
- 中间件：
  - 访问日志、限流、CORS、CSRF、Panic 恢复。
  - 基于 `jwt` 的认证中间件，支持多租户隔离。
- 输入输出严格校验，避免 SQL 注入与 XSS。

## 6. 扩展性

- 各模块以接口形式定义，新增认证协议只需实现 `auth.Provider` 接口并在配置中注册。
- 数据库与缓存层均预留版本迁移脚本，支持通过 `migrate` 工具升级。
- 通过 `plugins/` 目录支持业务插件，API 层暴露 Hook 以注入自定义逻辑。
- 与现有 `xcontrol/rag-server` 共享部分通用库（如 `config`、`logging`），保持代码风格一致。

## 8. 代码目录规划

后端代码位于根目录的 `account/` 下：

```
account/
  cmd/accountsvc/main.go     # 服务入口
  api/                       # REST 接口
  config/                    # 配置解析
  internal/
    auth/                    # LDAP/OIDC/SAML 适配器
    store/                   # PostgreSQL 持久化
    cache/                   # Redis 会话缓存
  sql/schema.sql             # 数据库表结构
```

前端目录扩展：

- `ui/panel/app/account/`：控制台新增账号模块页面。
- `dashboard/app/login/` 与 `dashboard/app/register/`：提供登录/注册页面，登录后根据身份跳转至用户或管理员界面。

## 7. 部署建议

- 提供 Dockerfile 与 Helm Chart，方便容器化部署。
- 通过 `Makefile` 集成构建、测试、Lint 等命令。
- 在 CI/CD 中加入静态扫描与单元测试，确保安全与稳定。

---
本设计文档为初步方案，后续可根据实际需求迭代更新。

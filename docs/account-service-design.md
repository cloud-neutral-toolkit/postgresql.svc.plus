# Account Service 设计说明

本文档描述 `account` 目录下账号服务的现状与演进方向，帮助研发、测试与运维人员快速理解该组件的职责、核心流程与可扩展性。

## 1. 背景与目标

账号服务用于在 XControl 生态内提供统一的注册、登录与会话查询能力，为后续的权限管控、业务系统集成提供基础身份数据。

主要目标：

- 提供面向用户的注册与登录接口，支持以邮箱为主键的账号体系。
- 提供标准的健康检查与会话管理接口，便于其它服务探活与拉取当前登录用户信息。
- 提供可替换的存储与认证接口，满足从 PoC 到生产的不同部署需求。

## 2. 系统架构

账号服务采用 Go 语言实现，入口位于 `account/cmd/accountsvc/main.go`，默认使用 Gin 框架启动 HTTP 服务并注册 REST API 路由。【F:account/cmd/accountsvc/main.go†L1-L12】

核心模块划分如下：

- `account/api`: 定义 REST API，并实现用户注册、登录、会话维护等业务逻辑。【F:account/api/api.go†L1-L190】
- `account/internal/store`: 提供用户数据的读写接口与内存实现，后续可扩展至数据库存储。【F:account/internal/store/store.go†L1-L109】
- `account/internal/auth`: 声明可插拔的第三方认证提供方接口，为接入 LDAP/OIDC 等外部系统提供抽象。【F:account/internal/auth/auth.go†L1-L6】
- `account/internal/cache`: 预留会话缓存接口，便于集成 Redis 等缓存组件。【F:account/internal/cache/cache.go†L1-L6】
- `account/config`: 管理服务配置结构体（当前为空定义，未来将扩展字段）。【F:account/config/config.go†L1-L5】

内部调用关系示意：

```
Gin Router → API Handler → Store / Session Manager → 数据存储
                               ↘ Auth Provider (可选)
```

## 3. 接口设计

### 3.1 健康检查
- `GET /healthz`
- 返回 `{ "status": "ok" }`，供探活或依赖服务检测。

### 3.2 用户注册
- `POST /v1/register`
- 请求体：`{ "name": string, "email": string, "password": string }`
- 功能：创建新用户，内部对密码执行 `bcrypt` 哈希后写入存储，返回脱敏后的用户信息。

### 3.3 用户登录
- `POST /v1/login`
- 请求体：`{ "email": string, "password": string }`
- 功能：校验凭据，通过内存存储读取用户并验证哈希密码，成功后生成 24 小时有效的会话 token。【F:account/api/api.go†L65-L136】

### 3.4 查询会话
- `GET /v1/session`
- Header 中提供 `Authorization: Bearer <token>` 或查询参数 `token`。
- 功能：校验 token，返回关联用户信息。【F:account/api/api.go†L138-L176】

### 3.5 注销会话
- `DELETE /v1/session`
- Header 或查询参数传入 token，删除内存中的会话记录。【F:account/api/api.go†L178-L190】

## 4. 数据模型

当前实现使用内存存储，结构体 `store.User` 定义了最小必要字段：`ID`、`Name`、`Email`、`PasswordHash` 与 `CreatedAt` 时间戳。【F:account/internal/store/store.go†L12-L18】

`memoryStore` 负责提供线程安全的增删查能力，并在创建用户时自动生成 UUID 与 UTC 时间，保证多实例场景中的唯一性。未来替换为数据库时，可在 `Store` 接口的基础上新增实现即可。【F:account/internal/store/store.go†L31-L109】

## 5. 安全与扩展

- **密码存储**：使用 `bcrypt` 哈希，防止明文泄露。【F:account/api/api.go†L90-L108】
- **会话管理**：会话 token 为 32 字节随机数生成的十六进制字符串，并设置 24 小时过期，过期后自动清理。【F:account/api/api.go†L112-L171】
- **扩展点**：
  - 可在 `Store` 接口层新增 PostgreSQL、MySQL 等实现。
  - 可实现 `auth.Provider` 接口以支持外部身份源认证，再与内部用户绑定。
  - 可基于 `cache.Cache` 抽象接入 Redis，实现跨实例的会话共享。

## 6. 后续计划

1. 丰富 `config.Config` 字段，支持从 YAML/ENV 读取监听端口、数据库、缓存等配置。
2. 将内存会话迁移到可持久化/分布式缓存，支持水平扩展。
3. 引入审计日志、登录失败限制等安全机制。
4. 整合统一的错误码与 API 文档输出，便于前后端协同。

---
本文档需根据功能演进持续维护，以确保服务的设计意图与实现保持一致。

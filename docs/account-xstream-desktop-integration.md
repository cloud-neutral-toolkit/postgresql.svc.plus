# XStream Desktop 同步集成方案（跨项目执行手册）

本手册将 `account` 服务与 XStream Desktop App 的改造步骤拆分为两条执行线，并给出跨项目协作时所需的接口契约、目录定位和数据格式。目标是在托管域名 `account.svc.plus` 以及自建部署中，以最小增量实现安全的 xray-core 配置同步，且在 URL 层不泄露任何敏感字段。

## 1. 账户服务改造（xcontrol/account）

### 1.1 HTTP 接口扩展

仅新增 `POST /api/config/sync`，位于 `account/api` 路由注册：

- **Handler 位置**：`account/api/config_sync.go`（新建文件），由 `api.RegisterRoutes` 中挂载到 `auth` 保护下的子路由组。
- **认证复用**：沿用 `xc_session` Cookie。若桌面端后续需要无 Cookie 调用，可在 `api/auth` 中增加“设备 Token”生成接口，但不影响本次实现。
- **请求结构**：
  ```text
  POST /api/config/sync
  Content-Type: application/octet-stream
  Body: <BinaryPayload>
  ```
  `BinaryPayload` 为私有格式，包含下列字段（序列化后整体加密）：`version(1B)`、`deviceFingerprint(32B)`、`clientVersion(string)`、`nonce(24B)`、`timestamp(int64)`、`lastConfigVersion(int32)`。
- **响应结构**：与请求相同为二进制包，字段包括：`version`、`status(OK|NO_PRIVILEGE|ERROR)`、`configVersion`、`xrayConfigJSON`（gzip 后再加密）、`subscriptionMetadata`（可选）。其中 `xrayConfigJSON` 直接复用 `xrayconfig.Generator` 输出，仅需确保 `outbounds` 中包含桌面端所需的最小字段集，例如：
  ```json
  {
    "outbounds": [
      {
        "protocol": "vless",
        "settings": {
          "vnext": [
            {
              "address": "xlts-aws-tky.svc.plus",
              "port": 1443,
              "users": [
                {
                  "id": "<user uuid>",
                  "encryption": "none",
                  "flow": "xtls-rprx-vision"
                }
              ]
            }
          ]
        },
        "streamSettings": {
          "network": "tcp",
          "security": "tls",
          "tlsSettings": {
            "serverName": "xlts-aws-tky.svc.plus",
            "allowInsecure": false,
            "fingerprint": "chrome"
          }
        }
      }
    ]
  }
  ```
- **重放保护**：服务端在 handler 中校验 `timestamp` ±5 分钟及 `nonce` 是否重复。重放窗口可复用现有 Redis/内存缓存（`account/internal/cache`）。

### 1.2 加密模块复用

- **Key 派发**：在 `account/internal/store/user.go` 中新增 `SyncSecret` 字段（可选），默认读取已有 `users.sync_secret` 列；若列不存在，可在迁移脚本中与 UUID 一致生成，确保最少改动。
- **算法实现**：在 `account/internal/crypto/syncpayload`（新目录）封装 `Encrypt(payload []byte, secret []byte)` 与 `Decrypt`，使用 `XChaCha20-Poly1305`。该算法 Go 侧可复用 `golang.org/x/crypto/chacha20poly1305`。
- **密钥管理**：管理员通过 `GET/POST /api/auth/admin/settings`（已存在）调整“桌面同步”开关；密钥不在接口返回，仅在数据库存储，客户端登录成功后通过 `/api/config/sync` 解包获得配置。

### 1.3 配置生成复用

- **数据来源**：继续使用 `account/internal/xrayconfig`。根据 `user.UUID` 作为 tenant_id，从 `Generator.Generate()` 获得完整 JSON。
- **差异化控制**：在 `xrayconfig` 中新增 `HasDesktopPrivilege(uuid string) bool`（读取管理员设置或用户标记），若返回 false，则 handler 返回 `status=NO_PRIVILEGE`，客户端保持现状。
- **审计 & 日志**：复用现有的 `logger.WithContext(ctx)`，记录 `uuid`、`deviceFingerprint`、`configVersion`。

### 1.4 自建部署兼容

- 配置文件 `config/account.yaml` 中新增：
  ```yaml
  desktopSync:
    enabled: true
    encryptionKeyTTL: 365d
    rateLimitPerDevicePerDay: 200
  ```
- `cmd/accountsvc/main.go` 读取上述配置，若关闭则在路由层直接返回 `404`。
- 所有其他同步流程（生成文件、写入磁盘、触发重启命令）保持不变。

## 2. XStream Desktop 客户端改造（xstream-desktop 仓库）

### 2.1 模块划分

| 模块 | 目录建议 | 说明 |
| ---- | -------- | ---- |
| Session 管理 | `app/core/session.ts` | 调用 `/api/auth/login`，保存 Cookie 或换取长期 Token。|
| Sync 客户端 | `app/sync/syncClient.ts` | 负责序列化请求包、调用 `POST /api/config/sync`、解密响应。|
| Xray 写盘 | `app/xray/configWriter.ts` | 将 `xrayConfigJSON` 写入本地文件，并在成功后调用已有的守护进程重启逻辑。|
| 状态管理 | `app/state/syncSlice.ts` | Redux/Pinia 等状态库中记录最近同步时间、配置版本。|

### 2.2 请求与加密

- 使用 `tweetnacl` 或 `libsodium` 的 XChaCha20-Poly1305 封装，与服务端保持一致。
- 请求前从持久层读取 `deviceFingerprint`（首次安装随机生成 32B 并写入 `~/.xstream/device_id`）。
- `nonce` 每次随机 24B，`timestamp` 为 Unix 毫秒。`lastConfigVersion` 取自本地缓存，便于服务端快速判断是否需要下发完整配置。
- 响应解析后根据 `status` 做差异化处理：
  - `OK`：写盘并在 UI 中显示“已同步”。
  - `NO_PRIVILEGE`：保持旧配置，提示用户检查订阅资格。
  - `ERROR`：记录日志并指数退避重试。

### 2.3 同步流程

1. **启动阶段**：应用启动时调用一次同步，并加载本地缓存的 `configVersion`。若解密失败则提示用户重新登录。
2. **定时任务**：使用 Electron/Node `setInterval`（建议 10 分钟）触发。后台静默发送请求，失败时最多连续重试 3 次。
3. **手动触发**：在设置页新增“立即同步”按钮，调用同一模块。
4. **降级策略**：若连续 24 小时失败，回退到“使用本地缓存配置”模式，但仍保留重试。

### 2.4 自建服务兼容

- 将域名与端口作为配置项放入 `app/config/default.json`，允许用户在 UI 中指定自建 `account.xxx.xxx`。
- 密钥管理完全依赖服务端：客户端只保存 `deviceFingerprint` 和 `configVersion`，其他敏感信息通过加密包下发。
- 若自建管理员关闭 `desktopSync.enabled`，客户端收到 404 时提示“服务未启用”。

## 3. 数据包格式（参考实现）

以下为双方共有的序列化格式，便于跨项目协作：

```text
struct SyncRequest {
  uint8  version;              // 固定 1
  bytes  deviceFingerprint[32];
  string clientVersion;        // UTF-8，前置 1 字节长度，最长 32
  bytes  nonce[24];
  int64  timestamp;            // Unix milliseconds
  int32  lastConfigVersion;
}

struct SyncResponse {
  uint8  version;              // 固定 1
  uint8  status;               // 0=OK,1=NO_PRIVILEGE,2=ERROR
  int32  configVersion;
  bytes  xrayConfigGzip;       // gzip(JSON)
  string subscriptionMetadata; // UTF-8，可为空
}
```

`Encrypt(SyncRequest)` 与 `Decrypt(SyncResponse)` 均使用 `XChaCha20-Poly1305(secret=User.SyncSecret, nonce)`；`nonce` 随请求发送，响应重新生成新的随机 `nonce` 并放入包头，避免重放。

## 4. 联调步骤

1. **准备环境**：在 `xcontrol/account` 启动 `make dev`，并在数据库中为测试账号写入 `sync_secret`。同时在本地运行 XStream Desktop Dev 构建。
2. **接口自测**：使用 `curl`/`httpie` 构造加密请求验证 `/api/config/sync`，确认返回状态正确。
3. **桌面端接入**：在 Desktop 项目中实现 `syncClient.ts`，确保能与本地 account 服务交互。
4. **端到端演示**：登录桌面端 → 手动同步 → 核验本地生成的 `config.json` 与 account 服务生成的文件一致。
5. **回归**：验证旧有管理员界面、注册/登录流程不受影响。

## 5. 安全与运维要点

- **最小数据面**：所有敏感字段都封装在加密包内，URL 与 Header 仅携带基础信息（Cookie）。
- **限流**：继续复用 `account/api/middleware/ratelimit`（若已有）或在 handler 中增加 per-device 限流。
- **审计**：在服务端日志中记录 `uuid`、`deviceFingerprint` hash、`status`，便于定位问题而不过度存储。
- **滚动升级**：版本字段可确保前后端同时升级；旧客户端仍可解析 version=1。

通过以上拆解，`account` 服务与 XStream Desktop App 均可按部就班地完成改造，且复用现有模块，避免过度设计。跨项目团队只需围绕接口契约与数据包格式协同，即可实现安全、可复用的桌面同步能力。

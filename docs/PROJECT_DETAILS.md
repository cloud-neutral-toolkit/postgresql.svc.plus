# PostgreSQL Service Plus

生产就绪的 PostgreSQL 运行时,包含向量搜索、中文分词、消息队列等扩展,支持多种安全部署模式。

## 🚀 快速开始

### 一键初始化 (推荐)

```bash
# 下载并运行初始化脚本
curl -fsSL https://raw.githubusercontent.com/cloud-neutral-toolkit/postgresql.svc.plus/main/scripts/init_vhost.sh | bash

# 或指定 PostgreSQL 版本和域名
bash scripts/init_vhost.sh 17 db.example.com
```

### 手动部署

```bash
# 1. 构建镜像
make build-postgres-image

# 2. 生成证书
cd deploy/docker && ./generate-certs.sh

# 3. 启动服务 (PostgreSQL + Stunnel TLS 隧道)
docker-compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d

# 4. 客户端连接 (通过 TLS 隧道)
psql "host=localhost port=5433 user=postgres dbname=postgres"
```

**详细指南**: 查看 [docs/QUICKSTART.md](docs/QUICKSTART.md)

## 📦 核心特性

### 多模型数据库

一个 PostgreSQL 实例替代多个专用数据库:

| 传统方案 | PostgreSQL 扩展 | 用途 |
|---------|----------------|------|
| Pinecone | **pgvector** | 向量嵌入和语义搜索 |
| Elasticsearch | **pg_jieba + pg_trgm** | 中文分词和全文搜索 |
| Kafka | **pgmq** | 轻量级消息队列 |
| MongoDB | **JSONB + GIN** | 文档存储 |
| Redis | **hstore + UNLOGGED** | 高速键值缓存 |

### 安全架构

- ✅ PostgreSQL 只监听容器内部 (127.0.0.1:5432)
- ✅ 所有外部访问通过 **stunnel TLS 隧道** (端口 443)
- ✅ 客户端使用本地 stunnel (localhost:15432)
- ✅ 应用无需配置 SSL,透明加密
- ✅ 支持三种 TLS 模式 (单向 TLS / 严格验证 / 双向 mTLS)


## 🔒 TLS 连接模式

stunnel 提供三种安全级别,**默认使用单向 TLS**:

### 模式总览

| 模式 | 默认 | 客户端配置 | 服务端配置 |
|------|------|-----------|-----------|
| **TLS (单向认证)** | ✅ 是 | `CAfile` + `verify=2` | 仅服务端证书 |
| **TLS + 严格验证** | 可选 | + `verifyChain` + `checkHost` | - |
| **mTLS (双向认证)** | 可选 | + `cert` + `key` | + `verify=2` + `CAfile` |

### 模式 1: TLS (默认 - 服务端认证)

```ini
[postgres-client]
client  = yes
accept  = 127.0.0.1:15432
connect = db.example.com:443
verify  = 2
# CAfile = ${STUNNEL_CA_FILE} (required only for private CA)
```

客户端验证服务端证书 (Mode 1), 服务端无需验证客户端。连接通过 `tls://db.example.com:443` 进行。

### 模式 2: TLS + 严格验证 (可选)

```ini
# 在模式 1 基础上添加:
verifyChain = yes
checkHost = db.example.com
```

额外验证证书链和主机名匹配。

### 模式 3: mTLS 双向认证 (高级 - 仅在需要时启用)

```ini
# 在模式 1 基础上添加:
cert = ${STUNNEL_CERT_FILE}
key  = ${STUNNEL_KEY_FILE}
```

⚠️ **mTLS 不是默认选项** - 仅在服务端明确要求时通过 `Mode 3` 启用。

### 配置文件参考

| 文件 | 用途 | 默认模式 |
|------|------|----------|
| `deploy/docker/stunnel-server.conf` | 服务端配置 | TLS (单向) |
| `deploy/docker/stunnel-client.conf` | 客户端配置模板 | TLS (单向) |
| `example/stunnel-client.conf` | 完整示例 (含三种模式) | TLS (单向) |

### 设计原则

- 🔐 信任基于 CA 证书,而非叶子证书
- 🔄 支持 ACME 证书自动轮换
- 📦 使用基于文件的便携式 TLS 资产
- 🚫 避免平台绑定的证书管理器

## 🏗️ 部署模式

| 模式 | 复杂度 | HTTPS | TLS隧道 | 适用场景 |
|------|--------|-------|---------|----------|
| 基础 + Stunnel | ⭐ | ❌ | ✅ | 开发测试 |
| Nginx + Certbot | ⭐⭐ | ✅ 自动 | ✅ | 小型生产 |
| Caddy | ⭐⭐ | ✅ 自动 | ✅ | 小型生产 |
| Kubernetes/Helm | ⭐⭐⭐ | 手动 | ✅ | 企业生产 |

### 🔄 CI/CD 自动化

**GitHub Actions 工作流**:
- ✅ 自动构建和推送镜像
- ✅ 一键部署到 VM (Docker Compose)
- ✅ 一键部署到 K8s/K3s (Helm)
- ✅ 多环境支持 (dev/staging/prod)

**快速部署**:
```bash
# GitHub Actions → Deploy to VM → Run workflow
# 或
# GitHub Actions → Deploy to Kubernetes → Run workflow
```

**详细指南**: [CI/CD 配置](docs/guides/github-actions-cicd.md) | [快速参考](docs/guides/CICD_QUICKREF.md)

## 🏗️ 架构图

### 安全访问架构

```
┌─────────────────────────────────────────────────────────────┐
│  应用服务器 (任意位置)                                          │
│                                                             │
│  ┌──────────────┐                                          │
│  │  应用程序     │  普通 PostgreSQL 连接                      │
│  │  (DB/API/Web) │  localhost:15432                         │
│  └──────┬───────┘  无需 sslmode                             │
│         ↓                                                   │
│  ┌──────────────┐                                          │
│  │ stunnel 客户端│  CAfile 验证服务端                         │
│  └──────┬───────┘                                          │
└─────────┼─────────────────────────────────────────────────┘
          │
          │ TLS 1.2+ 加密 (Internet, Port 443)
          │ tls://${HOST}:${TLS_PORT}
          ↓
┌─────────────────────────────────────────────────────────────┐
│  数据库服务器                                                 │
│                                                             │
│  ┌──────────────┐                                          │
│  │ stunnel 服务端│  0.0.0.0:5433 → Host:443                  │
│  └──────┬───────┘                                          │
│         │ 解密转发                                           │
│         ↓                                                   │
│  ┌──────────────┐                                          │
│  │  PostgreSQL  │  127.0.0.1:5432 (内部隔离)                │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📚 文档

### 快速导航

- **[快速开始](docs/QUICKSTART.md)** - 5分钟快速部署
- **[项目结构](docs/PROJECT_STRUCTURE.md)** - 了解项目组织
- **[架构设计](docs/ARCHITECTURE.md)** - 技术架构详解

### 部署指南

- **[Docker 部署](docs/deployments/docker-compose.md)** - Docker Compose 完整指南
- **[Helm 部署](docs/deployments/helm-chart.md)** - Kubernetes 生产部署

## 🔧 Makefile 命令

```bash
make help                    # 显示帮助信息
make build-postgres-image    # 构建 PostgreSQL 镜像
make push-postgres-image     # 推送镜像到仓库
make test-postgres          # 本地测试
make deploy-docker          # Docker Compose 部署
make deploy-helm            # Helm 部署
make clean                  # 清理测试容器
```

## 🔧 脚本工具

```bash
scripts/init_vhost.sh           # 一键初始化部署
scripts/init_vhost.sh reset     # 重置环境 (清理容器/证书)
scripts/init_vhost.sh help      # 显示帮助

scripts/fix_collation.sh        # 修复 collation 版本警告
scripts/clean-git-secrets.sh    # 清理 Git 历史敏感信息
scripts/generate-postgres-tls.sh # 生成 PostgreSQL TLS 证书
```

## 💡 使用示例

### Python 应用

```python
import psycopg2

# 通过 stunnel 客户端连接 - 无需 SSL 配置
conn = psycopg2.connect(
    host="localhost",  # stunnel client
    port=15432,
    user="postgres",
    password="${POSTGRES_PASSWORD}",
    database="postgres"
)
```

### Node.js 应用

```javascript
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',  // stunnel client
  port: 15432,
  user: 'postgres',
  password: '${POSTGRES_PASSWORD}',
  database: 'postgres'
});
```

### 环境变量

```bash
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:15432/postgres
```

## 🔐 安全特性

1. **网络隔离**: PostgreSQL 不直接暴露
2. **强制加密**: 所有连接通过 TLS 1.2+
3. **灵活认证**: 支持单向 TLS / 严格验证 / 双向 mTLS
4. **审计日志**: 完整的连接日志
5. **自动证书**: 支持 ACME (Let's Encrypt) 自动续期

## 📊 性能优化

- 预配置的 PostgreSQL 性能参数
- SSD 优化 (random_page_cost = 1.1)
- 连接池支持 (PgBouncer)
- 资源限制和健康检查

## 🛠️ 技术栈

- **PostgreSQL**: 16/17/18 (PGDG)
- **扩展**: pgvector, pg_jieba, pgmq, pg_cron
- **TLS 隧道**: stunnel4
- **证书管理**: Caddy (ACME) 或自签名
- **容器编排**: Docker Compose 或 Kubernetes/Helm

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎贡献! 请查看文档并提交 Pull Request。

## 📞 支持

- **文档**: [docs/](docs/)
- **问题**: GitHub Issues
- **示例配置**: [example/](example/)

---

**一个 PostgreSQL,替代多个数据库** 🚀

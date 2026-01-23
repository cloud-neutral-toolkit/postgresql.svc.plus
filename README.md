# PostgreSQL Service Plus

生产就绪的 PostgreSQL 运行时, 包含向量搜索、中文分词、消息队列等扩展, 支持多种安全部署模式。

## 📋 部署准备

1. **域名与网络**:
   - 准备一台拥有公网 IP 的 VPS/Vhost。
   - 配置 DNS 解析，将域名（如 `db.example.com`）指向该公网 IP（用于 ACME 自动化证书申请）。
   - 开放必要端口：`80` (HTTP 验证), `443` (Stunnel 默认端口)。

2. **资源规格 (推荐)**:
   - **最低配置**: 1 CPU / 2GB RAM / 20GB SSD (仅基础功能)。
   - **生产推荐**: 2 CPU / 4GB RAM+ / 50GB SSD+ (支持向量搜索与高并发扩展)。

## 🚀 快速开始

### 一键初始化 (推荐)

```bash
# 下载并运行初始化脚本
curl -fsSL https://raw.githubusercontent.com/cloud-neutral-toolkit/postgresql.svc.plus/main/scripts/init_vhost.sh | bash
```

```
# 或指定 PostgreSQL 版本和域名
bash scripts/init_vhost.sh 17 db.example.com
```

> **详细指南**: 查看 [docs/QUICKSTART.md](docs/QUICKSTART.md) | [完整指南](docs/PROJECT_DETAILS.md)

## 📦 核心特性

### 多模型数据库
一个 PostgreSQL 实例替代多个专用数据库:

| 传统方案 | PostgreSQL 扩展 | 用途 |
|----------|-----------------|------|
| Pinecone | **pgvector** | 向量嵌入和语义搜索 |
| Elasticsearch | **pg_jieba + pg_trgm** | 中文分词和全文搜索 |
| Kafka | **pgmq** | 轻量级消息队列 |
| MongoDB | **JSONB + GIN** | 文档存储 |
| Redis | **hstore + UNLOGGED** | 高速键值缓存 |

## 🏗️ 部署模式

| 模式 | 复杂度 | HTTPS | TLS隧道 | 适用场景 |
|------|--------|-------|---------|----------|
| 基础 + Stunnel | ⭐ | ❌ | ✅ | 开发测试 |
| Nginx + Certbot | ⭐⭐ | ✅ 自动 | ✅ | 小型生产 |
| Caddy | ⭐⭐ | ✅ 自动 | ✅ | 小型生产 |
| Kubernetes/Helm | ⭐⭐⭐ | 手动 | ✅ | 企业生产 |

### 🔄 CI/CD 自动化
GitHub Actions 工作流:
- ✅ 自动构建和推送镜像
- ✅ 一键部署到 VM (Docker Compose)
- ✅ 一键部署到 K8s/K3s (Helm)
- ✅ 多环境支持 (dev/staging/prod)

## 🛠️ 技术栈
- **PostgreSQL**: 16/17/18 (PGDG)
- **扩展**: pgvector, pg_jieba, pgmq, pg_cron, pg_trgm
- **TLS 隧道**: stunnel4
- **证书管理**: Caddy (ACME) 或自签名
- **容器编排**: Docker Compose 或 Kubernetes/Helm

---

## 📚 说明文档
- **[快速入门](docs/QUICKSTART.md)** - 5分钟完成部署
- **[详细指南](docs/PROJECT_DETAILS.md)** - 安全方案与高级配置
- **[项目结构](docs/PROJECT_STRUCTURE.md)** - 了解代码组织
- **[代码分析报告](docs/COMPLETION_REPORT.md)** - 技术实现细节

## 📝 许可证
MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献
欢迎贡献! 请查看文档并提交 Pull Request。

## 📞 支持
- **文档中心**: [docs/](docs/)
- **示例配置**: [example/](example/)
- **报告问题**: GitHub Issues

---
**一个 PostgreSQL, 替代多个数据库** 🚀

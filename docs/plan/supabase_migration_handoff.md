# PostgreSQL 多环境兼容与 Supabase 迁移规划 Handoff 文档

> **项目名称**：`ai-workspace-service` & `postgresql.svc.plus`  
> **文档目标**：标准化数据库兼容层，支持在 Supabase Cloud、自建 Supabase 及原生 `postgresql.svc.plus` 运行时之间无缝切换。  
> **当前状态**：经确认，`ai-workspace-service` 组织下的核心业务**尚未绑定 `pg_jieba` 和 `pgmq`**，现阶段已具备 100% 无缝切入 Supabase Cloud 的条件。

---

## 1. 架构全景与三种部署模式对比

为了满足不同场景下的物理隔离、运维成本与扩展需求，数据库层采用 **“三轨多模式驱动架构”**，仅需切换 `DATABASE_URL` 连接串即可实现环境自由切换。

```mermaid
graph TD
    App[ai-workspace-service 业务服务] --> Driver{数据库驱动适配层<br/>DATABASE_URL}
    
    Driver -->|模式 1: Supabase Cloud| Cloud[Supabase Cloud 云托管<br/>Direct 5432 / Supavisor 6543]
    Driver -->|模式 2: 自建 Supabase| SelfSupa[自建 Supabase Stack<br/>postgresql.svc.plus + Gateway]
    Driver -->|模式 3: postgresql.svc.plus| Native[原自建单机方案<br/>Stunnel 5443 / PG 5432]

    subgraph 云端 Serverless (零运维)
        Cloud --- C_Ext[pgvector + pg_trgm + pg_cron]
    end

    subgraph 自建全家桶 (私有部署)
        SelfSupa --- S_Ext[pgvector + pg_jieba + pgmq + Studio/Auth API]
    end

    subgraph 原生极轻量 (单机部署)
        Native --- N_Ext[pgvector + pg_jieba + pgmq]
    end
```

### 三种运行模式一览表

| 部署模式 | 扩展支持 | 网络与连接入口 | 运维成本 | 适用场景与优势 |
| :--- | :--- | :--- | :--- | :--- |
| **1. Supabase Cloud** | `pgvector` + 标准 PG 扩展 | 直连 5432 / Supavisor 6543 (原生 SSL) | **零运维** | 快速上线、免服务器维护、使用 Supabase 云端控制台、自动备份 |
| **2. 自建 Supabase** | `pgvector` + (可选 `pg_jieba`/`pgmq`) | Supabase Gateway / Studio (端口 8000) | 低 (Docker Stack) | 需要 Supabase Auth/Studio，但数据必须保留在私有云/本地 |
| **3. postgresql.svc.plus** *(原方案)* | `pgvector` + `pg_jieba` + `pgmq` | Stunnel 5443 (TLS) / PG 5432 | 自行维护 | 极轻量单机/K8s 部署，无需完整 Supabase 平台组件 |

---

## 2. 兼容性提升与落地实施步骤

为保证一套 DDL 脚本和数据库代码在三种模式下均能正常执行，需进行以下轻量改造：

### 步骤 1：SQL 初始化脚本增加“容错安全加载”机制
修改 `postgresql.svc.plus` 仓库中的 [`01-init-extensions.sql`](file:///Users/shenlan/workspaces/ai-workspace-service/postgresql/deploy/docker/init-scripts/01-init-extensions.sql)，使用 PL/pgSQL 块包裹非标准 C 扩展，防止在 Supabase Cloud 上执行中断：

```sql
-- 1. 核心标准扩展 (所有模式 100% 支持)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 可选 C 扩展 (安全尝试加载，失败时优雅跳过)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_jieba;
    RAISE NOTICE 'Successfully loaded pg_jieba';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping pg_jieba (not available in target environment)';
END $$;

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgmq;
    RAISE NOTICE 'Successfully loaded pgmq';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping pgmq (not available in target environment)';
END $$;
```

### 步骤 2：自动过滤 Schema 导出脚本
优化 [`export_schema_clean.sh`](file:///Users/shenlan/workspaces/ai-workspace-service/postgresql/scripts/export_schema_clean.sh)，在生成供 Supabase Cloud 导入的 DDL 时自动剔除不受支持的扩展：

```bash
#!/usr/bin/env bash
set -euo pipefail

DB_URL="${1:-postgres://shenlan:password@127.0.0.1:5432/account?sslmode=disable}"
OUT="/tmp/schema_supabase_clean.sql"

echo ">>> Exporting clean schema for Supabase Cloud..."
pg_dump --schema-only --no-owner --no-privileges "$DB_URL" \
  | grep -v -E "EXTENSION.*(pg_jieba|pgmq|pglogical)" \
  > "$OUT"

echo "✅ Clean schema generated at $OUT"
```

### 步骤 3：`postgresql.svc.plus` 基础镜像扩展补全
更新 [`postgres-runtime-wth-extensions.Dockerfile`](file:///Users/shenlan/workspaces/ai-workspace-service/postgresql/deploy/base-images/postgres-runtime-wth-extensions.Dockerfile)，预装 Supabase 生态所需基础扩展，以便自建 Supabase 时可作为基础 DB 镜像直接替换 `supabase/postgres`：

```dockerfile
# 补充 Supabase 平台依赖包
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-${PG_MAJOR}-pg-stat-statements \
    postgresql-${PG_MAJOR}-pg-net \
    && rm -rf /var/lib/apt/lists/*
```

---

## 3. 成本与选择建议

### 成本评估 (Supabase Cloud)
- **免费版 (Free $0/月)**：500MB 数据库存储，50,000 MAU，适合开发测试与 PoC。
- **生产版 (Pro $25/月)**：8GB 包含存储，100,000 MAU，永不休眠，包含 `pg_cron`。
  - **向量算力升配 (Compute Add-ons)**：若向量数据量增加，可弹性将内存扩容至 Small (2GB RAM, +$10/mo) 或 Medium (4GB RAM, +$60/mo)。

### 决策矩阵
1. **首选 Supabase Cloud**：项目刚上线、希望免去基础设施运维、快速使用托管控制台与 API。
2. **选择 自建 Supabase**：需要 Supabase 现代化 UI 与 Auth/API 工具链，但数据受限于私有云合规要求。
3. **选择 原生 `postgresql.svc.plus`**：低资源消耗的极轻量单机部署或已知环境中需要使用 `pg_jieba` 数据库内切词。

---

## 4. 交接与验证 Check List

- [ ] **SQL 容错合并**：更新 [`01-init-extensions.sql`](file:///Users/shenlan/workspaces/ai-workspace-service/postgresql/deploy/docker/init-scripts/01-init-extensions.sql) 中的扩展加载逻辑。
- [ ] **导出验证**：运行 [`export_schema_clean.sh`](file:///Users/shenlan/workspaces/ai-workspace-service/postgresql/scripts/export_schema_clean.sh)，验证生成的 `.sql` 文件能否成功在 Supabase Cloud SQL Editor 中一次性执行成功。
- [ ] **环境变量统一**：确保 `ai-workspace-service` 各微服务的数据库连接采用标准的 `DATABASE_URL`，支持配置 5432 / 6543 / 5443 端口。

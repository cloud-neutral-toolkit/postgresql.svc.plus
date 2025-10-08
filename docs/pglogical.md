# pglogical 双向逻辑复制部署指南

本文档介绍如何在两台 PostgreSQL 16 数据库之间部署 pglogical 扩展，实现支持 TLS 的异步双向逻辑复制，并包含冲突处理、监控及与 Bucardo 的对比。

## 目录

1. [pglogical 简介](#pglogical-简介)
2. [环境准备](#环境准备)
3. [安装 pglogical 扩展](#安装-pglogical-扩展)
4. [配置 PostgreSQL 参数](#配置-postgresql-参数)
5. [创建复制用户](#创建复制用户)
6. [创建节点与复制集](#创建节点与复制集)
7. [建立双向订阅](#建立双向订阅)
8. [验证复制状态](#验证复制状态)
9. [冲突解决策略](#冲突解决策略)
10. [TLS 配置示例](#tls-配置示例)
11. [常用维护命令](#常用维护命令)
12. [监控指标](#监控指标)
13. [性能与延迟优化建议](#性能与延迟优化建议)
14. [优缺点总结](#优缺点总结)
15. [推荐部署参数模板](#推荐部署参数模板)
16. [与 Bucardo 的对比](#与-bucardo-的对比)
17. [附录：SQL 脚本模板](#附录sql-脚本模板)

---

## pglogical 简介

| 特性 | 说明 |
| :--- | :--- |
| 类型 | 基于 WAL 的逻辑复制扩展（由 2ndQuadrant 开发，后并入 EDB/PGDG） |
| 复制粒度 | 表级 / 库级，支持选择性复制 |
| 拓扑 | 单向、一主多从、多主（双向）均可 |
| 延迟 | 秒级（异步逻辑流式复制） |
| 冲突 | 可配置（默认“先到先得”，支持自定义冲突解决） |
| DDL 支持 | 不自动复制 DDL（需两端结构一致） |
| 安全 | 继承 PostgreSQL 的 TLS / SCRAM / 证书机制 |
| 推荐版本 | PostgreSQL 13~17（pglogical 2.x/3.x） |

与 Bucardo 相比，pglogical 更现代、稳定、性能更高，且原生支持异步双向复制（multi-master）和 TLS 加密。

## 环境准备

假设部署架构如下：

| 节点 | 主机名 | 数据库 | 角色 |
| :--- | :--- | :--- | :--- |
| A | `cn-homepage.svc.plus` | `account` | `node_cn` |
| B | `global-homepage.svc.plus` | `account` | `node_global` |

两台节点均运行 PostgreSQL 16，并且网络互通。

## 安装 pglogical 扩展

在两台节点上安装 pglogical 软件包：

- **Ubuntu / Debian**

  ```bash
  sudo apt install postgresql-16-pglogical
  ```

- **Red Hat / CentOS**

  ```bash
  sudo yum install pglogical_16
  ```

安装完成后，在 `account` 数据库中创建扩展验证：

```sql
psql -d account -c "CREATE EXTENSION IF NOT EXISTS pglogical;"
```


## 创建 repl_user（基础复制用户）

在主库（Publisher）执行以下操作： sudo -u postgres psql

执行 SQL：
```
-- 创建用于逻辑/物理复制的底层用户
CREATE ROLE repl_user WITH LOGIN REPLICATION PASSWORD 'StrongPassword123!';
-- 确认创建成功
\du repl_user
```

输出应包含：

```
Role name | Attributes
-----------+-------------------------------
repl_user  | Replication, Login
```

## 创建 pglogical（逻辑复制应用用户）

仍在 PostgreSQL 中执行：
```
-- 创建逻辑复制用的应用账户
CREATE ROLE pglogical WITH LOGIN REPLICATION PASSWORD 'StrongPass';
-- 授权访问业务数据库（假设名为 account）
GRANT ALL PRIVILEGES ON DATABASE account TO pglogical;
```

⚠️ 注意：pglogical 账号仅需复制与读写权限，无需 SUPERUSER。
生产环境建议使用强密码、并限制来源 IP。


## 配置 PostgreSQL 参数

在两台节点的 `/etc/postgresql/16/main/postgresql.conf` 中设置逻辑复制所需参数：

```
# 修改 PostgreSQL 监听地址
listen_addresses = '*'

# 逻辑复制基础
wal_level = logical
max_wal_senders = 10
max_replication_slots = 10
max_worker_processes = 10
max_logical_replication_workers = 8

# 建议优化
shared_preload_libraries = 'pglogical'
track_commit_timestamp = on
```

## 配置访问控制（pg_hba.conf）

编辑主库（Publisher）上的 /etc/postgresql/16/main/pg_hba.conf 限定允许的远程节点:
```
# 本地管理
local   all             postgres                                peer
host    all             all             127.0.0.1/32            md5

# 允许复制与逻辑复制（加密连接）
hostssl replication     repl_user       <peer_ip>/32            scram-sha-256
hostssl all             pglogical       <peer_ip>/32            scram-sha-256
```

其中 <peer_ip> 为另一台数据库节点的 IP 地址或域名。

## 启用 TLS（postgresql.conf）

编辑 /etc/postgresql/16/main/postgresql.conf 检查下面配置是否存在

```
ssl = on
ssl_cert_file = '/etc/ssl/certs/svc.plus.crt'
ssl_key_file  = '/etc/ssl/private/svc.plus.key'
```

重启 PostgreSQL 生效 

sudo systemctl restart postgresql@16-main
或（简写方式）：
sudo systemctl restart postgresql

## 验证角色与访问

1️⃣ 查看角色列表 sudo -u postgres psql -c "\du"
应看到：

repl_user  | Replication, Login
pglogical  | Replication, Login

2️⃣ 订阅端测试连接

在另一台节点测试 TLS 登录： psql "host=<publisher_ip> user=pglogical password=StrongPass dbname=account sslmode=require"


成功进入 account=> 提示符表示逻辑复制用户配置完毕 ✅。


## 创建节点与复制集

现在进入目标数据库（account）： sudo -u postgres psql -d account

### 节点 A

```sql
-- 启用扩展
CREATE EXTENSION IF NOT EXISTS pglogical;

-- 注册节点
SELECT pglogical.create_node(
    node_name := 'node_cn',
    dsn := 'host=cn-homepage.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full'
);

-- 创建复制集，包含 public 模式下所有表
SELECT pglogical.create_replication_set('rep_all');
SELECT pglogical.replication_set_add_all_tables('rep_all', ARRAY['public']);
```

### 节点 B

```sql
CREATE EXTENSION IF NOT EXISTS pglogical;

SELECT pglogical.create_node(
    node_name := 'node_global',
    dsn := 'host=global-homepage.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full'
);

SELECT pglogical.create_replication_set('rep_all');
SELECT pglogical.replication_set_add_all_tables('rep_all', ARRAY['public']);
```

## 建立双向订阅

### 节点 CN 订阅节点 GLobal

```sql
SELECT pglogical.create_subscription(
    subscription_name := 'sub_from_global',
    provider_dsn := 'host=167.179.72.223 port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full',
    replication_sets := ARRAY['rep_all'],
    synchronize_structure := false,
    synchronize_data := true,
    forward_origins := '{}'
);
```

### 节点 GLobal 订阅节点 CN

```sql
SELECT pglogical.create_subscription(
    subscription_name := 'sub_from_cn',
    provider_dsn := 'host=47.120.61.35 port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full',
    replication_sets := ARRAY['rep_all'],
    synchronize_structure := false,
    synchronize_data := true,
    forward_origins := '{}'
);
```

参数说明：

- `synchronize_structure = false`：假设双方的表结构已对齐。
- `synchronize_data = true`：初次创建时自动进行数据同步。
- `forward_origins = '{}'`：防止回环复制，避免来自对端的写入再次回传。
- `sslmode = verify-full`：开启 TLS 并校验证书。

## 验证复制状态

常用验证命令：

```sql
SELECT * FROM pglogical.show_subscription_status();
SELECT * FROM pglogical.show_node_info();
```

查看流复制进度：

```sql
SELECT application_name, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication;
```

日志中出现如下信息表明表同步完成：

```
pglogical: initial copy of table "public.users" finished
```

## 冲突解决策略

pglogical 默认策略为 “first commit wins”。在开启 `track_commit_timestamp = on` 后，可以使用以下策略：

| 策略 | 含义 |
| :--- | :--- |
| `error` | 发生冲突时报错并终止复制 |
| `apply_remote` | 使用远端数据覆盖本地 |
| `keep_local` | 保留本地数据，忽略远端变更 |
| `latest_commit` | 保留提交时间更晚的行 |
| `custom` | 调用自定义函数处理冲突 |

示例：

```sql
SELECT pglogical.alter_subscription_options(
  subscription_name := 'sub_from_b',
  options := '{conflict_resolution=latest_commit}'
);
```

## TLS 配置示例

使用 `libpq` 连接参数即可启用 TLS：

```sql
SELECT pglogical.create_subscription(
    subscription_name := 'sub_from_b',
    provider_dsn := 'host=pgB.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full sslrootcert=/etc/ssl/rootCA.crt sslcert=/etc/ssl/client.crt sslkey=/etc/ssl/client.key',
    replication_sets := ARRAY['rep_all']
);
```

`sslmode` 支持 `require`、`verify-ca`、`verify-full`，推荐使用 `verify-full` 并确保证书 CN/SAN 与主机名匹配。

## 常用维护命令

| 操作 | SQL 命令 |
| :--- | :--- |
| 暂停订阅 | `SELECT pglogical.alter_subscription_disable('sub_from_b');` |
| 恢复订阅 | `SELECT pglogical.alter_subscription_enable('sub_from_b', true);` |
| 删除订阅 | `SELECT pglogical.drop_subscription('sub_from_b');` |
| 删除节点 | `SELECT pglogical.drop_node('node_a');` |

## 监控指标

| 表 / 视图 | 说明 |
| :--- | :--- |
| `pglogical.show_subscription_status()` | 订阅状态（延迟、复制槽、错误） |
| `pg_stat_replication` | WAL 流复制进度 |
| `pglogical.replication_set` | 当前同步的表集合 |
| `pglogical.local_sync_status` | 同步阶段（initial / catching-up / ready） |

## 性能与延迟优化建议

| 参数 | 推荐值 | 说明 |
| :--- | :--- | :--- |
| `max_replication_slots` | ≥ 10 | 允许更多并发订阅 |
| `max_wal_senders` | ≥ 10 | 支持更多并发流复制连接 |
| `maintenance_work_mem` | ≥ 128MB | 提高初始数据复制效率 |
| `synchronous_commit` | `off` | 降低写入延迟（异步复制场景） |
| `wal_compression` | `on` | 降低网络传输量 |
| `subscription_apply_delay` | 0–60 秒 | 可配置延迟重放，满足业务需求 |

## 优缺点总结

| 优点 | 缺点 |
| :--- | :--- |
| 原生逻辑复制，性能远优于 Bucardo | 不复制 DDL，需保证结构一致 |
| 支持 TLS / SCRAM / 双向复制 | 需要安装扩展（非纯 SQL） |
| 冲突处理策略灵活（`latest_commit` / `custom`） | 不适合同一行的高并发双写场景 |
| 延迟低（秒级） | 不支持系统表复制 |

## 推荐部署参数模板

| 项 | 配置 |
| :--- | :--- |
| 节点 A/B | PostgreSQL 16 + pglogical 3.6 |
| 通道 | TLS (`sslmode=verify-full`) |
| 复制方向 | 双向 |
| 延迟 | 2–10 秒 |
| 冲突策略 | `latest_commit` |
| 初始同步 | `synchronize_data = true` |
| 同步集 | 业务表（`users`、`identities`、`sessions`） |
| DDL 管理 | GitOps + 同步迁移脚本 |
| 监控 | Grafana + `pg_stat_replication` + `pglogical` 状态视图 |

## 与 Bucardo 的对比

| 维度 | pglogical | Bucardo |
| :--- | :--- | :--- |
| 复制机制 | WAL 逻辑流 | 触发器 + 队列 |
| 延迟 | 秒级 | 秒级至分钟级 |
| 性能 | 高 | 中 |
| 冲突控制 | 内置多策略 | Perl 自定义 |
| 安全 | 原生支持 TLS | 依赖 libpq TLS |
| 部署复杂度 | 中（需扩展） | 低（Perl 脚本） |
| 推荐场景 | 跨 Region 双向 / 实时异步复制 | 异地多活、低写负载场景 |

## 附录：SQL 脚本模板

可将上述配置整理为以下 SQL 脚本：

### `setup-node-a.sql`

```sql
-- 节点 A 初始化
CREATE EXTENSION IF NOT EXISTS pglogical;
SELECT pglogical.create_node(
    node_name := 'node_a',
    dsn := 'host=pgA.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full'
);
SELECT pglogical.create_replication_set('rep_all');
SELECT pglogical.replication_set_add_all_tables('rep_all', ARRAY['public']);
SELECT pglogical.create_subscription(
    subscription_name := 'sub_from_b',
    provider_dsn := 'host=pgB.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full',
    replication_sets := ARRAY['rep_all'],
    synchronize_structure := false,
    synchronize_data := true,
    forward_origins := '{}'
);
```

### `setup-node-b.sql`

```sql
-- 节点 B 初始化
CREATE EXTENSION IF NOT EXISTS pglogical;
SELECT pglogical.create_node(
    node_name := 'node_b',
    dsn := 'host=pgB.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full'
);
SELECT pglogical.create_replication_set('rep_all');
SELECT pglogical.replication_set_add_all_tables('rep_all', ARRAY['public']);
SELECT pglogical.create_subscription(
    subscription_name := 'sub_from_a',
    provider_dsn := 'host=pgA.svc.plus port=5432 dbname=account user=pglogical password=StrongPass sslmode=verify-full',
    replication_sets := ARRAY['rep_all'],
    synchronize_structure := false,
    synchronize_data := true,
    forward_origins := '{}'
);
```

### `verify-replication.sql`

```sql
-- 验证订阅状态
SELECT * FROM pglogical.show_subscription_status();
SELECT * FROM pglogical.show_node_info();

-- 检查复制进度
SELECT application_name, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication;
```

以上脚本可根据实际业务需要调整数据库名称、节点信息及复制集内容。

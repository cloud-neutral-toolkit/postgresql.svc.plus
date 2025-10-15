# 基于 Go 的 RAG 系统设计

本文档描述一个使用 Go 实现的 Retrieval Augmented Generation (RAG) 系统方案，满足多仓库文档同步、Markdown 解析与分块、向量化存储以及问答检索的需求。

## 1. 数据源同步

- **多仓库配置**：支持在配置文件中声明多个 GitHub 仓库及其关注路径，例如：
  - `repoA/docs/`
  - `repoB/guides/`
  - `repoC/tutorials/`
- **同步方式**：使用 `git clone` / `git pull` 将远程仓库同步到本地，定时任务或 Webhook 触发。
- **增量更新**：检测新增或修改的 Markdown 文档，触发后续嵌入流程。

## 2. Markdown 处理与分块

- 使用 `goldmark` 或 `blackfriday` 将 Markdown 渲染为纯文本。
- 对文档按照 500~1000 tokens 分块，保存每块的顺序和位置信息。
- 每个分块生成唯一 `chunk_id` 以便回溯源文档位置。

## 3. 向量化

- 默认嵌入模型：
  - [bge-m3](https://github.com/BAAI-bge/): 本地部署，HTTP 服务返回 1024 维向量。
  - [OpenAI `text-embedding-3-large`](https://platform.openai.com/docs/guides/embeddings): 通过 OpenAI API 获取 1024 维向量。
- 统一的 `Embed(text string) ([]float32, error)` 接口屏蔽具体实现，可在配置中切换模型。

## 4. 数据库设计

使用 PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)。初始化步骤：

1. 在目标数据库中启用扩展：
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. 按以下 SQL 创建存储向量的表及索引：

   ```sql
   CREATE TABLE documents (
       id BIGSERIAL PRIMARY KEY,
       repo TEXT NOT NULL,         -- 来源仓库
       path TEXT NOT NULL,         -- 文件路径
       chunk_id INT NOT NULL,
       content TEXT NOT NULL,
       embedding VECTOR(1024),     -- 向量
       metadata JSONB              -- 额外信息：标签/更新时间等
   );

   -- 向量索引
   CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

   -- 元数据索引
   CREATE INDEX idx_documents_metadata ON documents USING gin (metadata);
   ```

连接字符串示例：`postgres://user:password@127.0.0.1:5432`。

## 5. 检索与问答流程

1. 用户提出问题，服务端调用 `Embed()` 对问题生成向量。
2. 在 `documents` 表中通过 `cosine` 相似度检索 Top K 的分块。
3. 将检索结果拼装为 Prompt，调用 GPT/Claude 等大模型生成回答。
4. 返回答案并附带来源文档信息以便追溯。

### 5.1 前端 AskAIDialog 调用流程


1. 用户在 `AskAIDialog` 中输入问题，`handleAsk` 会先做去空格、去尾标点等规整并使用防抖避免短时间内重复发送。
2. 若 10 秒内命中过去问题的缓存，则直接返回缓存答案；否则把规整后的问题与最近对话历史组合为 `history`，POST 到 `/api/rag/query`，请求设置超时并以流式方式返回结果。
3. 流式结果会实时更新聊天记录，若返回 `answer` 与 `chunks`，则通过 `SourceHint` 展示检索到的来源。
4. 当 `answer` 为空或没有检索结果时，会在控制台记录回退原因，并调用 `/api/askai` 获取普通 AI 回答，同样带有超时限制。
5. 最终的回答写入缓存并通过 `ChatBubble` 组件显示给用户，形成完整的 RAG 聊天流程。

## 6. Go 代码模块划分

```
rag-server/internal/rag/
├── config/          # 仓库与模型配置
├── sync/            # GitHub 同步逻辑
├── ingest/          # Markdown 解析与分块
├── embed/           # 向量化接口实现
├── store/           # PostgreSQL + pgvector 操作封装
└── api/             # REST/gRPC 接口，提供问答与同步触发
```

各模块通过 `go-pg`/`pgx`、`go-git` 等库实现，协程与通道用于提升并行处理能力。

## 7. 未来扩展

- 支持更多文件格式，如 PDF、HTML。
- 嵌入向量批量写入以提升效率。
- 引入缓存与摘要生成，进一步优化响应速度。

以上设计为后续实现提供结构化指导，可在项目中逐步落地。

## 8. 同步与查询测试

### 8.1 启动依赖服务

```bash
docker run -d --name pgvector \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  ankane/pgvector:latest

docker run -d --name redis -p 6379:6379 redis
```

### 8.2 配置 rag.yaml

```yaml
redis:
  addr: "127.0.0.1:6379"
  password: ""
module: "moonshotai/Kimi-K2-Instruct"
vectordb:
  pgurl: "postgres://user:password@127.0.0.1:5432"
datasources:
  - name: Xstream
    repo: https://github.com/svc-design/Xstream
    path: docs
  - name: XControl
    repo: https://github.com/svc-design/XControl
    path: docs
  - name: documents
    repo: https://github.com/svc-design/documents
```

### 8.3 运行同步

```bash
# 同步并处理所有 Markdown 文件
./xcontrol-cli --config rag.yaml
```

该命令会克隆或更新数据源仓库，扫描 Markdown 文件，并逐个解析、分块、调用 BGE Embed 并通过 `/api/rag/upsert` 写入数据库。

### 8.4 手动测试 Upsert 接口

在同步流程之外，也可以通过 `curl` 手动向 `/api/rag/upsert` 写入一条记录：

```bash
curl -X POST http://localhost:8080/api/rag/upsert \
  -H "Content-Type: application/json" \
  -d '{"docs":[{"repo":"example","path":"doc.md","chunk_id":1,"content":"hello","embedding":[0.1,0.2],"metadata":{},"content_sha":"abc"}]}'
```

若向量数据库未就绪，接口会返回 `error` 字段提示连接问题。

### 8.5 查询接口

同步完成后，可通过 curl 测试 `/api/rag/query`：

```bash
curl -X POST http://localhost:8080/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is XControl?"}'
```

请求体必须包含 `question` 字段。若数据写入成功，将返回相关的 `chunks` 列表；若返回 `{"chunks":null}`，请检查同步日志、数据库连接与配置文件是否正确。

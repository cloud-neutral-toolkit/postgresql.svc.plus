# AI 问答知识库系统设计

本文档描述如何在 XControl 项目中构建一个基于 RAG（Retrieval Augmented Generation）的 AI 问答知识库系统。参考 `ASK AI` 中的模块化建议，系统采用 Go 实现，注重可扩展和易维护。

## 1. 选用服务

- **文档同步**：使用 `go-git` 拉取或更新 GitHub 仓库，可定时执行或通过 Webhook 触发。
- **文档转文本**：利用 `Pandoc` CLI 或 `goldmark` 将 Markdown 等格式转为纯文本。
- **分块策略**：按标题或段落切割，生成 `Chunk` 结构体并记录位置信息。
- **向量化**：可调用 OpenAI `text-embedding-3-small`，或本地部署 `bge-large-zh` 通过 HTTP 服务提供 Embedding。
- **向量存储**：PostgreSQL + `pgvector` 扩展，使用 `pgx` 进行读写。
- **检索与问答**：相似度查询后构建 Prompt，调用 GPT/Claude 等模型生成回答。
- **Web UI (可选)**：Gin 提供 REST API，前端可使用 React/Next.js。

## 2. 接口与配置文件

接口示例：

```go
// rag-server/api.go
func RegisterRoutes(r *gin.Engine, db *pgx.Conn) {
    r.POST("/sync", SyncHandler)
    r.POST("/ask", AskHandler)
}
```

配置文件示例 `config/repos.yaml`：

```yaml
repos:
  - url: https://github.com/example/docs.git
    branch: main
    path: data/docs
```

## 3. 数据结构

```go
// ingest/chunk.go
// Chunk 表示切分后的文档片段
struct Chunk {
    DocID   string
    Content string
    Meta    map[string]any
}
```

数据库表 `chunks`：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    doc_id TEXT,
    content TEXT,
    vector vector(1024),
    metadata JSONB
);
```

## 4. Ingest 流程

1. 调用 `SyncRepo()` 同步文档。
2. 通过 `Pandoc` 或 `goldmark` 转为纯文本。
3. 按标题/段落切割，生成 `Chunk` 对象。
4. 调用 `Embed()` 得到向量并写入 `chunks` 表。

示例代码：

```go
// sync/sync.go
func SyncRepo(ctx context.Context, url, workdir string) (string, error) { /* ... */ }

// ingest/embed.go
func Embed(text string) ([]float32, error) { /* 调用 Embedding 模型 */ }
```

## 5. 项目代码规划

```
  internal/rag/
  ├── sync/                  # Git 克隆/更新
  ├── ingest/                # 文档转换与分块
  ├── embed/                 # 向量化
  ├── store/                 # 向量存储封装
  ├── llm/                   # Prompt 构造与问答流程
  ├── api/                   # REST API
  └── config/                # 同步仓库配置
```

以上规划提供了最小可用的 AI 问答知识库实现思路，可在此基础上逐步完善。 

# /api/rag/query 500 Internal Server Error 排查

## 现象
- 服务日志反复出现 500 响应：`POST "/api/rag/query" | 500 | ~150-570ms | 127.0.0.1`
- 同时段 `/api/askai` 正常，说明 Web/API 服务整体仍在运行，仅 RAG 检索接口异常。

## 触发路径
1. `/api/rag/query` 接口在 `server/api/rag.go` 中实现。请求体解析成功后会调用 `ragSvc.Query(...)`，若返回任意非 `ragembed.HTTPError` 的错误会直接以 500 响应给前端。【F:server/api/rag.go†L76-L103】
2. `ragSvc.Query` 的核心逻辑位于 `internal/rag/service.go`：
   - 先根据配置调用嵌入服务生成问题向量；
   - 然后用配置中的 PostgreSQL DSN 连接向量库；
   - 接着查询 `documents` 表的向量与全文结果并融合排序。【F:internal/rag/service.go†L55-L133】【F:internal/rag/service.go†L137-L196】
3. 一旦连接数据库或执行查询失败，函数会将错误上抛，最终导致步骤 1 中的 500。

## 根因分析
- 服务器配置文件 `server/config/server.yaml` 将向量库地址写死为 `postgres://shenlan:password@127.0.0.1:5432/shenlan`。【F:server/config/server.yaml†L19-L22】
- 在生产部署（如 Kubernetes Pod）中，PostgreSQL 并不和应用容器同机运行，访问 `127.0.0.1:5432` 会立即返回 `connection refused`。
- 该连接错误在 `ragSvc.Query` 中没有被特殊处理，最终导致 Gin 记录的 500 响应，耗时约 150-570ms 与 TCP 连接失败重试耗时一致。

## 解决方案
1. **更新配置**：将 `global.vectordb.pgurl` 调整为实际可达的数据库地址（例如集群内的 Service DNS），并确保网络策略允许访问。
2. **可选的防御性改进**：
   - 在 `/api/rag/query` 增加对数据库连接错误的判定，降级为返回空结果并记录日志，而非直接 500。
   - 为 RAG 服务增加健康检查或告警，提前暴露向量库不可达的问题。

按上述配置修正后，接口应恢复 200 响应并返回命中的文档片段。

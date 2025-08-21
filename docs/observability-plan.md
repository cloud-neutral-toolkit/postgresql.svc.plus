# 项目监控与可观测性方案

本文档梳理了为 XControl 项目添加监控、日志与追踪能力的计划，涵盖 Prometheus 指标、Loki 日志以及 OpenTelemetry 链路追踪。

## 1. 整体监控架构设计
- 监控栈：Prometheus + Loki + OpenTelemetry Collector。
- 统一指标、日志、trace 的命名规范。
- 通过环境变量或配置文件控制监控开关、采样率与导出端点。

## 2. Prometheus Metrics
- **Go 服务**：使用 `prometheus/client_golang`，在 `gin` 中挂载 `/metrics`，提供请求延迟、状态码、数据库与 Redis 访问指标。
- **Node/Next.js 前端**：使用 `prom-client`，暴露基础 HTTP 指标及自定义业务计数。
- **其他语言组件**：根据语言选择对应 SDK 并添加核心指标。
- 提供 docker-compose/Helm 配置，让 Prometheus 抓取各服务的 `/metrics`。

## 3. Loki LogQL 日志
- **Go 端**：采用 `slog` 或 `logrus` + Loki hook，输出 JSON 结构化日志并包含 `{job, service, trace_id}` 等标签。
- **Node 端**：使用 `pino` 或 `winston`，输出 JSON 日志，通过 Loki transport 或 `promtail` 收集。
- 在所有日志中注入 `trace_id`、`span_id`，便于与 tracing 关联。
- 更新部署脚本以配置 Loki 接收端或 promtail。

## 4. OpenTelemetry Tracing
- **Go 服务**：集成 `go.opentelemetry.io/otel`，启用 gin/pgx/redis 自动 instrumentation，使用 OTLP exporter。
- **Node/Next.js**：引入 `@opentelemetry/api` 与 `@opentelemetry/sdk-node`，启用 HTTP/Fetch 等自动 instrumentation，发送 trace 到 OTel Collector。
- 其他语言组件按需选择对应 OTel SDK，实现上下文传递。
- 将 `trace_id`、`span_id` 加入日志，指标中添加 exemplar/label 实现跨链接。

## 5. 部署与配置管理
- 提供示例配置或环境变量（`PROMETHEUS_ENDPOINT`, `LOKI_URL`, `OTEL_EXPORTER_OTLP_ENDPOINT`）。
- 编写 docker-compose 或 Kubernetes manifests，将 Prometheus、Loki 与 OTel Collector 纳入基础设施。
- 更新文档说明如何在本地与生产环境启用监控以及常用查询示例。

## 6. 验证与测试
- 为关键监控点编写单元或集成测试，保证指标、日志格式正确。
- 在 CI/CD 流程中增加 lint/test 防止监控代码被破坏。
- 本地启动后通过 `curl /metrics`、Loki 查询以及 Jaeger/Tempo UI 验证输出。


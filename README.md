# XControl

XControl is a modular multi-tenant management platform written in Go. The project integrates several optional components to provide a visual control plane for traffic statistics, configuration export and multi-node management.

This repository contains the API server, agent code and a Next.js-based UI.

## Components

- **dashboard**
- **ui-panel**
- **xcontrol-cli**
- **xcontrol-server**

All UI components provide both Chinese and English interfaces.

## Tech Stack

| Category         | Technology            | Version                    |
|------------------|-----------------------|----------------------------|
| Gateway          | OpenResty             | 1.27.1.2                   |
| BackendFramework | Go                    | 1.24                       |
| FrontFramework   | Next.js/Node.js/Yarn  | 14.1.0/v22.20.0/4.10.3     |
| Cache            | Redis                 | 8.2.0                      |
| Database         | PostgreSQL + pgvector | 14.18                      |
| Model (Local)    | HuggingFace Hub + Ollama | baai/bge-m3, llama2:13b |
| Model (Online)   | Chutes.AI  | baai/bge-m3, moonshotai/Kimi-K2-Instruct |

## LangChainGo 核心功能集成一览

XControl 通过 LangChainGo 统一接入多种大模型，并为 AskAI、CLI 与 Server 提供链式调用能力：

- **LLM 接口层（Model I/O）**：统一调用 Hugging Face、Ollama、OpenAI 兼容模型接口。
- **Chains（链式流程）**：将 prompt、检索结果、工具调用等组合成完整流程，支持 RAG、聊天、代码生成等场景。
- **工具与 Agent 体系**：定义 Web 搜索、实现 ReAct 风格的工具调用。
- **向量检索与数据接入**：适配 PGVector 向量存储。
- **文档加载与分块**：提供 Document Loaders 与 Text Splitters，用于处理长文本与构建向量检索块。
- **Memory 与历史追踪**：支持 Conversation Buffer 等对话记忆机制，增强交互体验。


## Supported Platforms

Tested on **Ubuntu 22.04 x64** and **macOS 26 arm64**.

## Installation

```bash
make install
make init-db   # initialize database (optional)
```

## Frontend configuration

The Next.js dashboard now resolves service endpoints through `dashboard/config/runtime-service-config.yaml`. The runtime
configuration selects values based on `NEXT_PUBLIC_RUNTIME_ENV` (falling back to `NODE_ENV` and the file's
`defaultEnvironment`). Use `NEXT_PUBLIC_ACCOUNT_SERVICE_URL` for ad-hoc overrides, otherwise adjust the YAML file to specify
environment-specific URLs such as `http://localhost:8080` for development/test and `https://account.svc.plus` for production.

## Content operations

- Markdown articles live under [`content/`](./content). Each file starts with a YAML frontmatter block that defines
  `title`, `summary`, `version`, `updatedAt`, `tags`, `status`, `author`, and optional `links`. The [`content/README.md`](./content/README.md)
  documents the schema in detail.
- The dashboard exposes a `GET /api/content/<slug>` endpoint powered by `remark` that renders Markdown to HTML, collects
  headings, and surfaces git commit metadata for version tracking. Frontend slots can consume this API via the
  `MarkdownContentSlot` component.
- Run [`scripts/sync-content.sh`](./scripts/sync-content.sh) with `CONTENT_REPO_URL` (and optional `CONTENT_REPO_BRANCH`,
  `CONTENT_REPO_SUBDIR`) to push the latest content into an external documentation repository as part of your GitOps flow.

## Account service configuration

`account/config/account.yaml` now accepts a `server.publicUrl` value such as `https://account.svc.plus:8443`. The account service
uses this URL to derive a default CORS origin and to document the externally reachable host. Set `server.allowedOrigins` when you
need to expose additional browser clients; omit it to fall back to the public URL or the local development origins
(`http://localhost:3001` and `http://127.0.0.1:3001`).

## Features
- **XCloudFlow** Multi-cloud IaC engine built with Pulumi SDK and Go. GitHub →
- **KubeGuard** Kubernetes cluster application and node-level backup system. GitHub →
- **XConfig** Lightweight task execution & configuration orchestration engine. GitHub →
- **CodePRobot** AI-driven GitHub Issue to Pull Request generator and code patching tool. GitHub →
- **OpsAgent** AIOps-powered intelligent monitoring, anomaly detection and RCA. GitHub →
- **XStream** Cross-border developer proxy accelerator for global accessibility. GitHub →

The [docs](./docs) directory contains a more detailed [overview](./docs/overview.md) and design documents for each module.

## Building
```
make build
```
This produces a binary under `bin/xcontrol`. Run `make agent` to build the node agent.

## Testing
```
make test
```

## Deployment

```bash
make start
```

This launches the server, dashboard and panel. Use `make stop` to stop all components.

The API server also accepts a custom configuration file:

```bash
xcontrol-server --config path/to/server.yaml
```

## Logging

Both `xcontrol-cli` and `xcontrol-server` accept a `--log-level` flag to control verbosity. The level may be one of `debug`, `info`, `warn`, or `error`:

```bash
xcontrol-cli --log-level debug
xcontrol-server --log-level warn
```

The server's log level can also be set in the configuration file:

```yaml
log:
  level: info
```

The flag value takes precedence over the configuration file.

## Changelog

See [docs/changelog.md](./docs/changelog.md) for a list of completed changes, including all work from Milestone&nbsp;1.

## Roadmap

The roadmap below is also available in [docs/Roadmap.md](./docs/Roadmap.md).

## License

This project is licensed under the terms of the [MIT License](./LICENSE).

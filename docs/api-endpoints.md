# API Endpoints

This document describes the HTTP endpoints provided by the XControl platform. Each entry lists the request method and path, required parameters, and a sample curl command for verification.

## Account Service（MFA/TLS 支持）

The standalone account service exposes user registration, MFA provisioning, and login endpoints on its configured host (default `http://localhost:8080`).

### POST /api/auth/register
- **Description:** Create a new local user with email/password credentials.
- **Body Parameters (JSON):**
  - `name` – Display name.
  - `email` – Unique email address.
  - `password` – Password with at least 8 characters.
- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"demo","email":"demo@example.com","password":"Secret123"}'
  ```

### POST /api/auth/mfa/totp/provision
- **Description:** Issue a temporary TOTP secret (and QR code) for Google Authenticator binding. Requires an MFA challenge token returned by the login flow.
- **Body Parameters (JSON):**
  - `token` – MFA challenge token obtained from a prior `/api/auth/login` attempt.
  - `issuer` – Optional override for the TOTP issuer label.
  - `account` – Optional override for the account label in authenticator apps.
- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/mfa/totp/provision \
    -H "Content-Type: application/json" \
    -d '{"token":"<MFA_TOKEN_FROM_LOGIN>"}'
  ```

### POST /api/auth/mfa/totp/verify
- **Description:** Confirm the generated one-time passcode and activate MFA for the user.
- **Body Parameters (JSON):**
  - `token` – MFA challenge token used during provisioning.
  - `code` – 6-digit TOTP from Google Authenticator/oathtool.
- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/mfa/totp/verify \
    -H "Content-Type: application/json" \
    -d '{"token":"<MFA_TOKEN_FROM_LOGIN>","code":"123456"}'
  ```

### POST /api/auth/login
- **Description:** Issue a session cookie after validating credentials and MFA. The first request after registration returns `401 mfa_setup_required` with an `mfaToken` used for provisioning. Once MFA is enabled, supports both password+TOTP and email+TOTP-only flows.
- **Body Parameters (JSON):**
  - `identifier` – Email or username.
  - `password` – Optional when performing email+TOTP-only login.
  - `totpCode` – Required once MFA is enabled.
- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -c cookies.txt \
    -d '{"identifier":"demo@example.com","password":"Secret123","totpCode":"123456"}'
  ```

### GET /api/auth/mfa/status
- **Description:** Inspect MFA status for a user using either a session token or the pending `mfaToken`.
- **Parameters:**
  - Query `token` or header `X-MFA-Token` when checking a pending MFA challenge.
- **Test:**
  ```bash
  curl "http://localhost:8080/api/auth/mfa/status?token=<MFA_TOKEN_FROM_LOGIN>"
  ```

### GET /api/auth/session
- **Description:** Return sanitized user information for the active session, including MFA status.
- **Headers:** `Cookie` header with `account_session` value.
- **Test:**
  ```bash
  curl -b cookies.txt http://localhost:8080/api/auth/session
  ```

> **TLS note:** When `accountsvc` is started with certificates, replace `http://` with `https://` and add `-k` for curl if using self-signed certificates during development.

## GET /api/users
- **Description:** Return all users.
- **Parameters:** None.
- **Test:**
  ```bash
  curl -s http://localhost:8080/api/users
  ```

## GET /api/nodes
- **Description:** Return all nodes.
- **Parameters:** None.
- **Test:**
  ```bash
  curl -s http://localhost:8080/api/nodes
  ```

## POST /api/sync
- **Description:** Clone or update a knowledge repository.
- **Body Parameters (JSON):**
  - `repo_url` – Git repository URL.
  - `local_path` – Destination directory on the server.
- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/sync \
    -H "Content-Type: application/json" \
    -d '{"repo_url": "https://github.com/example/repo.git", "local_path": "/tmp/repo"}'
  ```

## POST /api/rag/sync
- **Description:** Trigger RAG background synchronization. The endpoint streams
  plain-text progress logs during the sync.
- **Parameters:** None.
- **Test:**
  ```bash
  curl -N -X POST http://localhost:8080/api/rag/sync
  ```
- **Notes:** A future evolution could expose this operation via a gRPC
  streaming RPC. That approach would allow high-speed synchronization, rate
  limiting, and resumable transfers over long-lived connections while
  supporting dynamic, lossless queues for weak networks.

## POST /api/rag/upsert
- **Description:** Upsert pre-embedded document chunks into the RAG database.
- **Body Parameters (JSON):**
  - `docs` – Array of documents each containing `repo`, `path`, `chunk_id`, `content`, `embedding`, `metadata`, and `content_sha`.
- **Test:**

curl -X POST http://localhost:8080/api/rag/upsert \
     -H "Content-Type: application/json" --data-binary @/Users/shenlan/workspaces/XControl/docs/upsert_1024.json
  ```bash
Expected response on success: `{"rows":1}`. If the vector database is unavailable, the endpoint returns `{"rows":0,"error":"..."}`.

## POST /api/rag/query
- **Description:** Query the RAG service.
- **Body Parameters (JSON):**
  - `question` – Query text.
- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/rag/query \
    -H "Content-Type: application/json" \
    -d '{"question": "What is XControl?"}'
  ```
  When copying the multi-line example above, ensure your shell treats the trailing
  `\` characters as line continuations. Copying literal `\n` sequences will cause
  `curl: (3) URL rejected: Bad hostname` errors. You can also run the command on a
  single line without the backslashes:

  ```bash
  curl -X POST http://localhost:8080/api/rag/query -H "Content-Type: application/json" -d '{"question": "What is XControl?"}'
  ```

## POST /api/askai
- **Description:** Ask the AI service for an answer. The endpoint uses [LangChainGo](https://github.com/tmc/langchaingo) to communicate with the configured model provider (e.g., OpenAI-compatible services or a local Ollama instance). Ensure the server configuration includes the proper token or local server URL.
- **Body Parameters (JSON):**
  - `question` – Question text.
**Configuration:** In `server/config/server.yaml` the `models` section selects the LLM and embedding providers.
For local debugging with HuggingFace and Ollama:

```yaml
models:
  embedder:
    models: "bge-m3"
    endpoint: "http://127.0.0.1:9000/v1/embeddings"
  generator:
    models:
      - 'llama2:13b'
    endpoint: "http://127.0.0.1:11434"
```

For online services using Chutes:

```yaml
#models:
#  embedder:
#    models: "bge-m3"
#    endpoint: "https://chutes-baai-bge-m3.chutes.ai/embed"
#    token: "cpk_xxxx"
#  generator:
#    models:
#      - 'moonshotai/Kimi-K2-Instruct'
#    endpoint: "https://llm.chutes.ai/v1"
#    token: "cpk_xxxx"
```

The `api.askai` section controls request behaviour:

```yaml
api:
  askai:
    timeout: 60   # seconds
    retries: 3    # retry attempts
```

- **Test:**
  ```bash
  curl -X POST http://localhost:8080/api/askai \
    -H "Content-Type: application/json" \
    -d '{"question": "Hello"}'
  ```

## GET Localhost embeddings API

1. 运行（首次会自动下载模型）
python offline_embed_server.py
2. 测试接口

1) 健康检查（端口就绪即返回 ok） curl -v http://127.0.0.1:9000/healthz
2) 就绪检查（模型加载完成后返回 ready） curl -v http://127.0.0.1:9000/readyz
3) 调用 embeddings

curl http://127.0.0.1:9000/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model":"BAAI/bge-m3","input":["你好","PGVector 怎么建 HNSW？"]}'

如果你要把 DEVICE 固定为 mps 并行内核，保留默认即可；如需落回 CPU：DEVICE=cpu python docs/offline_embed_server.py。

## GET Localhost Ollama API

用流式接收（推荐）：

curl http://127.0.0.1:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:20b",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Tell me three tips for optimizing HNSW in PostgreSQL."}
    ],
    "max_tokens": 512,
    "stream": true
  }'
这样会实时输出分块数据

curl http://127.0.0.1:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3:latest",
    "messages": [{"role":"user","content":"你好，简要介绍一下自己"}],
    "max_tokens": 200,
    "temperature": 0.7
  }'


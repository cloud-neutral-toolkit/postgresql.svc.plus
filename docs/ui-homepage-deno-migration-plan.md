# `ui/homepage` Deno Runtime Migration Plan

## 1. 背景与目标
`ui/homepage` 目前基于 Next.js 14，在 Node.js 环境中通过 Yarn 和一系列脚本完成构建、导出与运行。【F:ui/homepage/package.json†L1-L38】【F:ui/homepage/Makefile†L1-L83】【F:ui/homepage/start.sh†L1-L16】

为支持 Deno runtime（包括 Deno Deploy、本地 `deno run` 以及容器化部署），需要系统性评估并替换现有依赖 Node.js 运行时假设的部分。本规划文件旨在：

- 盘点 `ui/homepage` 中依赖 Node.js 专有 API / 工具链的功能；
- 给出分阶段的迁移策略，尽量保持与现有 Next.js 功能对齐；
- 拆解出可执行的子任务，支撑逐步迁移。

## 2. Node.js 依赖现状分析

### 2.1 构建与运行命令
- `package.json` 中所有脚本均通过 `node` 或 `yarn` 启动 Next CLI / 自定义脚本。【F:ui/homepage/package.json†L6-L17】
- 顶层 Makefile / `start.sh` 假设系统已安装 Node.js 与 Yarn，并使用 `npm install` 构建产物。【F:ui/homepage/Makefile†L1-L83】【F:ui/homepage/start.sh†L1-L16】
- Dockerfile 直接以 `node:20` 作为构建镜像并输出静态资源，再以 Nginx 托管。【F:ui/homepage/Dockerfile†L1-L12】

### 2.2 配置文件与 CommonJS
- `next.config.js` 使用 CommonJS `require`/`module.exports`，并在运行时访问 `process.env`。【F:ui/homepage/next.config.js†L1-L64】
- Tailwind 与 PostCSS 配置同样使用 CommonJS 导出。【F:ui/homepage/postcss.config.js†L1-L6】【F:ui/homepage/tailwind.config.js†L1-L14】
- `vitest.config.ts` 通过 Node.js `path` 模块构建别名，需要 Node 的内置模块支持。【F:ui/homepage/vitest.config.ts†L1-L25】

### 2.3 构建前置脚本
- `yarn prebuild` 调用 `scripts/export-slugs.ts`、`scripts/scan-md.ts`、`scripts/fetch-dl-index.ts`；脚本大量使用 `fs`、`path`、`process` 等 Node 内置模块。【F:scripts/export-slugs.ts†L1-L63】【F:scripts/scan-md.ts†L1-L58】【F:scripts/fetch-dl-index.ts†L1-L37】
- 这些脚本写入 `ui/homepage/public/_build/`、`public/dl-index/` 等目录，用于页面渲染数据。

### 2.4 运行时（SSR / API 路由）
- Next App Router 下的 API Route 主要调用后端 REST 服务，本身大多使用 `fetch`，对 Deno 兼容性良好；但 `lib/download-manifest.ts` 等 server-only 模块同步读取文件系统，依赖 Node `fs`/`path`。【F:ui/homepage/lib/download-manifest.ts†L1-L23】
- `lib/serviceConfig.ts` 与各页面/组件通过 `process.env` 读取环境变量，需要过渡到 `Deno.env.get` 或在构建阶段注入配置。【F:ui/homepage/lib/serviceConfig.ts†L1-L107】

### 2.5 测试与开发工具
- Vitest、Testing Library 等依赖 Node.js (特别是 JSDOM)；`vitest` CLI 默认使用 Node 执行。
- 本地开发流程依赖 `yarn dev` 与 Node 的 HMR 服务。

## 3. 迁移策略与建议

### 3.1 建立 Deno 任务与依赖管理
1. 在仓库根目录新增 `deno.json` / `deno.jsonc`，定义 `tasks` 映射（如 `deno task dev` -> `deno run -A npm:next dev`），并声明所需 `npm` 依赖，启用 Deno 的 Node 兼容层。
2. 通过 `deno vendor` 或 `deno.json` 中的 `imports`，集中管理 TypeScript 路径别名，替代现有 `tsconfig` 中的 Node 解析。
3. 调整 CI/Makefile：将 `yarn` 调用替换为 `deno task`，保留向后兼容的回退命令（过渡期可提供双轨脚本）。

### 3.2 配置文件改造
1. 将 `next.config.js`、`postcss.config.js`、`tailwind.config.js` 转为原生 ESM（如重命名为 `.mjs` 或使用 `export default`）。在配置内部避免 `require`，使用 `import` 并为 Deno 提供类型提示。
2. 检查 Next.js 版本，启用官方对 Deno 的实验支持（如 `experimental.runtime = 'edge'` 或 `experimental.appDir: true`），确保 App Router 能以 Edge Runtime 打包。
3. 若仍需 CommonJS（例如 Tailwind CLI），使用 `npm:` 包由 Deno Node 兼容层执行，或迁移到 `tailwindcss@canary` 支持的 ESM 导出。

### 3.3 构建脚本迁移
1. 将 `scripts/*.ts` 改写为兼容 Deno 的模块：
   - 用 `Deno.readTextFile` / `Deno.writeTextFile` / `Deno.mkdir` 替代 `fs`。
   - 使用 `new URL('.', import.meta.url)` 和 `Deno.cwd()` 替代 `__dirname`、`process.cwd()`。
   - 捕获异常时避免 `process.exit`，改用抛错或 `Deno.exit`。
2. 将脚本注册到 `deno.json` 的 `tasks` 中（如 `deno task prebuild`），供 Next 构建流程调用。
3. 若继续兼容 Node 构建，可在脚本中引入运行时分支，检测 `globalThis.Deno` 后切换到相应 API。

### 3.4 运行时代码适配
1. 将 `lib/download-manifest.ts` 中的 Node API 替换为 Deno 文件读取，或在构建阶段生成静态 JSON，运行时仅通过 `import` 读取。
2. 整理 `process.env` 使用：
   - 客户端公开变量保持 `NEXT_PUBLIC_*`，由 Next 在编译阶段注入；
  - 服务器端逻辑（如 `lib/serviceConfig.ts`）改用封装的 `getEnv(name)`，内部在 Deno 环境使用 `Deno.env.get` 并提供 Node 回退，确保在多 runtime 下统一获取配置。
3. 审查 `app/api/**` 与服务器组件：确认是否使用 Node 限定模块（目前主要是 `console`、`fetch`，可直接在 Deno Edge Runtime 运行）。

### 3.5 测试与开发体验
1. 评估是否迁移到 `deno test` + `std/testing`，或继续使用 Vitest（通过 `deno run -A npm:vitest`）。
2. 若保留 Vitest，需要：
   - 在 `deno.json` 的 `tasks` 中添加 `"test": "deno run -A npm:vitest run"`；
   - 确保配置文件（`vitest.config.ts`）使用 ESM 并避免 Node-only API，或通过 `npm:path` 兼容模块。
3. 在文档中更新开发流程，指导使用 `deno task dev` 启动 Next 开发服务器。

### 3.6 部署与容器
1. 若目标是 Deno Deploy：优先使用 Next 的静态导出（`NEXT_SHOULD_EXPORT=true`）并将静态资源托管到 Deno Deploy 静态站点；或使用 `@deno/next`（实验性）以 Edge Runtime 部署。
2. 更新 Dockerfile：改用 `denoland/deno:alpine`（或合适镜像）执行 `deno task build`，将 `out/` 拷贝到最终镜像，或直接在 Deno 容器内运行 Edge 兼容服务。
3. 清理 Node.js 安装脚本（`start.sh` 等），提供 Deno 版本的部署脚本。

## 4. 迁移子任务拆解
下表列出推荐的实施顺序与依赖关系：

| 阶段 | 子任务 | 关键文件 / 目录 | 说明 | 前置 |
| --- | --- | --- | --- | --- |
| 1 | 建立 Deno 项目骨架 | 仓库根目录、`docs/` | 新增 `deno.json`、`README` 更新、定义 `deno task`。 | 无 |
| 1 | 配置文件改造为 ESM | `ui/homepage/next.config.js`、`postcss.config.js`、`tailwind.config.js`、`vitest.config.ts` | 切换到 `export` 语法，移除 CommonJS；需要验证 Next 对 ESM 配置的支持。 | 阶段1骨架 |
| 2 | 构建脚本 Deno 化 | `scripts/*.ts`、`ui/homepage/lib/download-manifest.ts` | 替换 `fs/path/process`，实现跨 runtime 工具模块。 | 配置 ESM |
| 2 | 环境变量适配 | `ui/homepage/lib/serviceConfig.ts` 及引用 | 引入 `getEnv` 工具，确保 Deno/Node 双环境可用。 | 阶段2脚本 |
| 3 | 开发/测试任务迁移 | `deno.json`、`ui/homepage/package.json`、`ui/homepage/Makefile` | 在 Deno 任务中封装 `next dev`、`vitest`；决定是否保留 `yarn`。 | 前述任务 |
| 3 | 部署脚本与容器更新 | `ui/homepage/Dockerfile`、`ui/homepage/start.sh` | 替换为 Deno 镜像/脚本，更新运维文档。 | 开发任务 |
| 4 | 可选：替换 Node-only 依赖 | 第三方 npm 包 | 评估 `pdfjs-dist`、`react-grid-layout` 等在 Deno 中的兼容性，必要时寻找替代或自行打包。 | 以上完成 |

## 5. 风险与注意事项
- **Next.js 在 Deno 的稳定性**：需关注官方支持状况，必要时考虑将 SSR 功能改造为静态导出或迁移到 Fresh/Preact 等 Deno 原生框架。
- **Node.js 兼容层性能**：使用 `deno run -A npm:...` 会拉起 Node 兼容层，需评估启动速度及部署体积。
- **第三方包可用性**：部分 npm 包依赖 Node 原生模块（如 `pdfjs-dist` 的 WASM 加载、`react-grid-layout` 的依赖链）。在 Deno 中使用 `npm:` 时需测试或手工打包。
- **CI/CD 更新**：构建流水线、版本锁定策略需同步调整，防止 Node/Deno 并存导致的依赖冲突。

---

> 本规划文件将根据实际迁移进展持续更新，请在实施过程中记录新增风险与解决方案。

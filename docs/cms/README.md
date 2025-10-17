# XControl CMS 平台指南

本文档介绍如何使用全新的 CMS 配置、扩展生态以及主题定制流程，帮助团队快速落地内容管理方案。

## 使用说明

1. **配置文件位置**：所有实例统一使用 [`config/cms.json`](../../config/cms.json) 描述模板、主题、扩展及内容源。提交前可运行 `make lint-cms` 或 GitHub Actions 自动校验以确保配置符合 JSON Schema。
2. **模板管理**：
   - `templates` 数组声明可用模板的 `name` 与入口文件 `entry`；
   - 可添加 `description` 与 `previewPath` 提供运营预览信息；
   - 模板内可读取主题变量 `theme.variables`，应通过公共的 `@xcontrol/cms-theme` SDK 获取。
3. **主题切换**：
   - `theme` 字段记录版本、作者与可覆写的变量；
   - 在 CI/CD 中读取 `theme.version` 控制静态资源缓存；
   - 自定义变量建议遵循 `kebabCase` 或 `camelCase`，并在设计系统中记录来源。
4. **扩展启用**：
   - `extensions` 数组列出扩展包；`enabled=false` 的扩展会被打包但默认不挂载；
   - `config` 字段由扩展自行解析，应在扩展仓库提供 JSON Schema 或 TypeScript 类型定义；
   - 推荐将第三方密钥通过环境变量传入扩展，避免写入配置文件。
5. **内容源配置**：
   - `contentSources` 支持 `git`、`filesystem`、`api` 和 `database` 四种类型；
   - 每个内容源都需要一个唯一的 `name` 与自定义 `options`；
   - 若设定 `readOnly: true`，发布面板会禁用写入操作。

## 扩展开发手册

1. **开发准备**：
   - 使用 `pnpm create @xcontrol/cms-extension <name>` 脚手架初始化项目；
   - 在 `package.json` 中声明入口 `main` 与 `module`，同时导出扩展元数据 `getExtensionMeta()`。
2. **生命周期**：
   - 扩展需实现 `register(app, context)` 方法，在其中挂载路由、配置表单或任务；
   - 扩展可通过 `context.cmsConfig` 读取解析后的 `cms.json`；
   - 对长耗时任务使用 `context.queue.enqueue`，避免阻塞渲染线程。
3. **测试与发布**：
   - 使用 `pnpm test` 运行扩展单测；
   - 通过 `pnpm build` 生成产物，并在 `dist/manifest.json` 中输出能力声明；
   - 发布到内网 NPM 仓库后，可在主项目 `config/cms.json` 中引用。

## 主题定制指南

1. **继承基础主题**：复制官方主题仓库 `@xcontrol/cms-theme-galaxy`，在 `tokens/` 中调整颜色、排版、阴影等设计变量。
2. **变量发布**：
   - 执行 `pnpm build` 生成 `theme.json`；
   - 在仓库中创建 `releases/<version>` 标签，与 `cms.json` 的 `theme.version` 对齐；
   - 将 `theme.json` 发布到静态资源 CDN，配置 `THEME_REGISTRY_URL` 指向该地址。
3. **模板调试**：
   - 本地运行 `pnpm dev --template <template-name>`，自动读取主题变量热更新；
   - 使用 `previewPath` 提供的静态图检视最终效果；
   - 主题变量新增时记得更新 `theme.variables` 以同步到配置文件。


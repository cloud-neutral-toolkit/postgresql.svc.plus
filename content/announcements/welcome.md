---
title: "欢迎使用内容中心"
summary: "了解如何在 Dashboard 中渲染版本化的 Markdown 内容。"
version: "v0.1.0"
updatedAt: "2025-02-01T08:00:00Z"
tags:
  - announcements
  - knowledge-base
status: "published"
author: "XControl Docs"
links:
  - label: "内容同步指南"
    href: "https://example.com/content-sync"
---

# 欢迎来到内容中心

XControl 现在内置了一个轻量的内容引擎，可以直接从 `content/` 目录加载 Markdown 文档，并通过 API 渲染到 Dashboard 插槽中。借助 Git 的提交历史，你可以在界面中查看最近一次内容更新的作者、提交信息和时间。

## 内容写作规范

- 使用上方的 Frontmatter 字段维护标题、版本号、标签和更新时间。
- Markdown 正文支持 **GitHub Flavored Markdown**，包括表格、任务列表和脚注。
- 需要引用外部链接时，可以在 `links` 列表中添加 `label` 与 `href`。

## 版本化流程

1. 在本地创建或更新 Markdown 文件。
2. 提交 Pull Request，确保描述内容更新的目的。
3. 合并后，Git 提交历史会自动显示在 Dashboard 的版本信息卡片中。

> 小贴士：使用 `scripts/sync-content.sh` 可以把 `content/` 目录推送到外部文档仓库，保持多端同步。

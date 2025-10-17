# CMS 核心流量页面与关键交互梳理

本文梳理目前 CMS 驱动的前端体验中，访问量最高、交互最频繁的页面模块，以及对应的技术实现入口，方便在投产与回滚时迅速定位代码。

## 导航与渠道选择

- `Navbar` 组件在 `dashboard/components/Navbar.tsx` 中实现，除品牌、语言切换外，还提供发行渠道筛选功能，允许访客选择 `stable`、`beta`、`develop` 三种体验。组件会读取 `featureToggles` 树并动态过滤导航项，且在客户端持久化所选渠道，确保功能入口与后端配置保持一致。 【F:dashboard/components/Navbar.tsx†L1-L144】【F:dashboard/lib/featureToggles.ts†L1-L96】

## 首页 (`/`)

- 入口位于 `dashboard/app/page.tsx`。页面首先读取 `cmsExperience/homepage/dynamic` Feature Flag，当开关关闭时直接回退到基于 Markdown 的旧首页 `dashboard/ui/pages/homepage.tsx`，避免渲染 CMS 新模板。 【F:dashboard/app/page.tsx†L1-L25】【F:dashboard/ui/pages/homepage.tsx†L1-L35】
- 当开关开启时，页面通过 `templateRegistry` 渲染动态模板，并向槽位注入以下高频组件： 【F:dashboard/app/page.tsx†L16-L25】【F:dashboard/src/templates/default/index.tsx†L1-L40】
  - `ProductMatrix`：在服务端读取解决方案列表并传给客户端组件 `ProductMatrixClient`，后者提供专题 Tab 切换、CTA 按钮与简介内容。 【F:dashboard/components/home/ProductMatrix.tsx†L1-L18】【F:dashboard/components/home/ProductMatrixClient.tsx†L1-L143】
  - `ArticleFeed`：按时间排序输出新闻卡片，支持多作者、多标签展示。 【F:dashboard/components/home/ArticleFeed.tsx†L1-L71】
  - `Sidebar`：渲染侧栏推荐卡片，支持标签云或富文本说明。 【F:dashboard/components/home/Sidebar.tsx†L1-L12】【F:dashboard/components/home/SidebarCard.tsx†L1-L38】
  - `ContactPanel`：在 `ProductMatrix` 中以粘性布局呈现联络方式、二维码等转化入口。 【F:dashboard/components/home/ProductMatrix.tsx†L1-L18】【F:dashboard/components/home/ContactPanel.tsx†L1-L45】
- CMS 数据源统一封装在 `dashboard/cms/content/homepage.ts`，并受同一 Feature Flag 控制；当开关关闭时，各数据函数将返回安全的空结果，避免误触发新体验。 【F:dashboard/cms/content/homepage.ts†L1-L319】

## 文档中心 (`/docs`)

- 总览页位于 `dashboard/app/docs/page.tsx`，提供资源卡片列表与 Feature Flag 守卫。每张卡片展示所属分类、最新版本与版本数量。 【F:dashboard/app/docs/page.tsx†L1-L48】
- 资源入口 `dashboard/app/docs/[collection]/page.tsx` 在生成静态参数与请求时都会校验 `/docs` 开关，并自动跳转到默认版本。 【F:dashboard/app/docs/[collection]/page.tsx†L1-L33】
- 版本详情页 `dashboard/app/docs/[collection]/[version]/page.tsx` 结合面包屑与客户端视图组件 `DocCollectionView`：
  - `DocCollectionView` 支持版本下拉切换、简介折叠、标签提示，并在切换版本时通过 `router.replace` 同步 URL。 【F:dashboard/app/docs/[collection]/[version]/DocCollectionView.tsx†L1-L136】
  - 视图模式（PDF / HTML）由 `DocViewSection` 驱动，提供多种阅读体验入口。 【F:dashboard/app/docs/[collection]/[version]/DocCollectionView.tsx†L13-L61】【F:dashboard/app/docs/[collection]/[version]/DocViewSection.tsx†L1-L200】

## 下载中心 (`/download`)

- 页面入口 `dashboard/app/download/page.tsx` 受 `appModules` Feature Flag 控制，加载资源清单后通过 `DownloadSummary` 呈现聚合统计，再由 `DownloadBrowser` 提供目录树与资源浏览。 【F:dashboard/app/download/page.tsx†L1-L32】【F:dashboard/components/download/DownloadSummary.tsx†L1-L80】【F:dashboard/components/download/DownloadBrowser.tsx†L1-L160】

## Cloud IaC 矩阵 (`/cloud_iac`)

- 页面入口 `dashboard/app/cloud_iac/page.tsx` 校验 `appModules` Flag，主体组件 `CloudIacCatalog` 提供云厂商过滤、搜索与统计反馈：
  - 支持多选筛选与“一键全选”，通过状态管理控制按钮样式。 【F:dashboard/components/iac/CloudIacCatalog.tsx†L1-L116】
  - 搜索同时覆盖产品名称、简介、高亮以及各云厂商对应产品别名，确保跨厂商对比体验。 【F:dashboard/components/iac/CloudIacCatalog.tsx†L18-L86】【F:dashboard/components/iac/CloudIacCatalog.tsx†L118-L192】
  - 结果区展示当前筛选命中数、关键指标与跳转链接，帮助用户快速进入 GitOps / Terraform 配置。 【F:dashboard/components/iac/CloudIacCatalog.tsx†L194-L320】

## Feature Flag 配置

- 新增的 `cmsExperience.homepage.dynamic` Feature Flag 定义在 `dashboard/config/feature-toggles.json` 中，并在 `dashboard/lib/featureToggles.ts` 暴露为合法配置段落。禁用该开关即可立即回退到旧版 Markdown 首页。 【F:dashboard/config/feature-toggles.json†L1-L40】【F:dashboard/lib/featureToggles.ts†L1-L96】


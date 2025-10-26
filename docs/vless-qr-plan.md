# VLESS 二维码功能规划

## 背景
- 用户中心目前仅展示 UUID、用户名、邮箱等信息，无法直接提供 VLESS 客户端配置。
- 已知默认节点配置位于 `/opt/homebrew/etc/xray-vpn-node-jp.json`，多数字段在不同用户之间保持固定，只有 UUID 需要按账号动态替换。
- 需求是为每位用户生成基于默认配置的 VLESS 链接，并在用户中心渲染对应的二维码（完全在前端本地生成，不依赖外部服务）。
- 同步提供内置客户端配置模板（xray JSON），用户可下载后直接使用，仅需确认 UUID 已正确写入。

## 功能目标
1. 在用户中心首页新增 “VLESS 二维码” 卡片：
   - 展示二维码图像，并提供保存二维码图像的入口。
   - 提供一键复制 VLESS 链接按钮。
   - 提示当前节点基础信息（地区、协议等）。
2. 所有二维码与链接均基于默认配置生成，且仅 UUID 可根据用户信息动态变化。
3. 新增“导出配置”操作，下载包含用户 UUID 的 `xray-client-config.json` 文件，并提示其敏感性。
4. 保持与既有界面风格一致，并适配暗色 / 亮色主题。

## 默认配置映射
根据示例配置生成的 VLESS URI 结构如下：
```
vless://{UUID}@tky-connector.onwalk.net:1443
  ?type=tcp
  &security=tls
  &flow=xtls-rprx-vision
  &encryption=none
  &sni=tky-connector.onwalk.net
  &fp=chrome
  &allowInsecure=0
#Tokyo-Node
```
说明：
- `UUID` 取自用户模型中的 `user.uuid`（回退到 `user.id`）。
- `allowInsecure=false` 将映射为查询参数 `allowInsecure=0` 方便客户端理解。
- 末尾片段（片名）暂定为 `Tokyo-Node`，后续可通过 i18n 字段调整。
- 上述 URI 需进行 URL 编码后才能生成二维码文本。
- 用于导出的 JSON 模板完全基于 `/opt/homebrew/etc/xray-vpn-node-jp.json`，仅将 `users[0].id` 替换为用户 UUID。

## 数据来源与状态
- `user` 实例来自 `useUser()` hook，已在用户中心页面使用。
- 为确保扩展兼容性，若缺失 UUID 则禁用二维码、导出及复制操作并展示占位文案。
- 将默认配置常量保存在前端 `lib` 下（例如 `DEFAULT_VLESS_TEMPLATE`），确保仅在生成链接或导出文件时消费。

## 技术实现
1. **工具函数**
   - 新增 `buildVlessUri(uuid: string): string` 方法（路径建议：`dashboard/src/extensions/builtin/user-center/lib/vless.ts`）。
   - 负责拼接 URI、执行编码、返回原始字符串供复制或 QR 使用。
   - 提供 `buildVlessConfig(uuid: string): XrayConfig`，返回替换 `users[0].id` 后的 JSON 对象。
   - 提供 `serializeConfigForDownload(config: XrayConfig): string`，用于格式化 JSON 字符串。
2. **二维码生成**
   - 复用已有 `qrcode` npm 包（已用于 MFA），通过 `toDataURL` 异步生成 base64 图像。
   - 在 `useEffect` / `useMemo` 中监听 `uuid` 变化并更新二维码数据。
   - 支持“下载二维码”按钮，通过创建隐藏 `<a>` 元素并将 dataURL 作为下载链接。
   - 生成失败时记录 `console.warn` 并展示错误态。
3. **React 组件布局**
   - 在 `dashboard/src/extensions/builtin/user-center/components/` 下新增 `VlessQrCard.tsx`，封装展示逻辑：
     - 接收 `uuid`、`copyText`、`labels`、`configTemplate` 等属性。
     - 内部管理二维码状态、复制按钮、下载二维码、导出 JSON、加载 & 错误提示。
     - 导出 JSON 时调用 `buildVlessConfig` 并生成 `Blob`，文件名采用 `xray-client-config.json`。
   - 在 `UserOverview.tsx` 中引入该组件，放入栅格布局中（建议与 UUID 卡片同行）。
   - 确保组件在缺省 UUID 时显示提示并禁用交互。
4. **样式与设计**
   - 继续复用 `Card` 组件，保持圆角、边距一致。
   - 二维码尺寸建议 `160px`，自适应容器。
   - 在复制与导出按钮上沿用现有 `Copy`、`Download` 图标，并使用 `Button.Group` 或 `Space` 排列。
5. **国际化**
   - 在 `dashboard/i18n/translations.ts` 中新增文案：标题、描述、按钮（复制链接、下载二维码、下载配置）、状态提示、敏感信息警告等中英文内容。
   - 警示文案需提醒用户“UUID 是唯一凭证，请妥善保管，勿随意分发”。
   - 在卡片内展示不同系统的放置路径提示：
     - `MacOS: /opt/homebrew/etc/config.json`
     - `Linux: /usr/local/etc/config.json`
6. **可测试性**
   - 单元测试范围有限，重点通过手动验证：
     - 登录后查看二维码是否正常生成。
     - 复制按钮是否获取正确的 VLESS 链接。
     - 二维码下载与配置导出文件内容是否匹配默认模板。
     - UUID 缺失时的回退 UI 及按钮禁用。

## 风险与缓解
- **浏览器兼容**：`navigator.clipboard` 可能不可用，沿用现有回退写法；文件下载依赖 `URL.createObjectURL`，需在清理阶段释放对象 URL。
- **安全性**：VLESS 链接与配置包含敏感信息，仅在用户登录后展示，不做额外缓存；下载前弹出确认或显示警示提醒用户妥善保管。
- **扩展性**：若未来存在多节点，可将默认配置抽离为数组并提供选择器，同时更新生成逻辑以支持多模板。

## 里程碑
1. 完成工具函数与数据模板实现，包括 URI 及 JSON 生成。
2. 集成二维码卡片、下载操作，并通过 i18n 文案。
3. 手动验证二维码显示、复制、下载、导出流程后准备 PR。

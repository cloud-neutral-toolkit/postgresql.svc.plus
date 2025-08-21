使用步骤
# 1) 添加文件
#   .github/project.yml
#   scripts/bootstrap_project.sh
#   .github/workflows/project-auto-add.yml

# 2) 本地或 CI 登录 GitHub CLI
gh auth login

# 3) 初始化 Project（首次/需要重放时）
chmod +x scripts/bootstrap_project.sh
./scripts/bootstrap_project.sh .github/project.yml

# 初始化后：

- 会在 svc-design 名下创建名为 “Light-IDP OIDC/LDAP Stabilization” 的 Projects v2 看板
- 规范化 Status 选项、创建 Milestone/Priority 字段、创建「Kanban / MVP (Table) / Stability (Table)」视图
- 按 .github/project.yml 将 #1–#6 加入（若尚不存在，会在 svc-design/XControl 内创建对应 issue）

本地 CLI（推荐命令）

- 查看当前登录与作用域 gh auth status
- 直接给现有令牌追加作用域（无需重新登录）# 追加项目读写 + 组织只读 + 仓库完全权限（你脚本会创建 issue）
gh auth refresh -h github.com -s project -s read:project -s read:org -s repo

如果 gh auth refresh 提示不能刷新，则用设备授权重新登录并勾选作用域：

gh auth login -h github.com -p https -s project -s read:project -s read:org -s repo

重新运行脚本 ./scripts/bootstrap_project.sh .github/project.yml

说明

Projects v2 API 目前需要“经典”PAT 作用域 project/read:project。细粒度 PAT 还没完整覆盖到 Projects v2（至少在 CLI 场景下不稳定），因此建议使用 CLI 的设备授权或经典 PAT。

你已有 repo、read:org，只差 read:project/project。

GitHub Actions（如在 CI 中跑脚本）

如果你打算在 workflow 里运行初始化脚本，需要把权限从 project 改为 projects（复数！）并授予写入：

permissions:
  contents: read
  issues: write
  pull-requests: write
  projects: write   # ← 修正这里（之前如果写成 project 会失败）


另外，使用默认的 GITHUB_TOKEN 时，需在仓库 → Settings → Actions → General 里将 Workflow permissions 设为 Read and write permissions，否则对 Projects 的写操作会被拒。

# 常见坑位速查

- unknown flag: --private/--public：已在你的脚本里移除；现在 gh project create 默认创建私有项目，公开需要到网页端手动切换。
- 创建组织级项目失败：需要对组织具备创建 Projects 的权限；否则在你的用户空间创建（脚本已自动查找 user 与 org 两侧）。
- 版本过旧：建议 gh --version >= 2.50（gh update

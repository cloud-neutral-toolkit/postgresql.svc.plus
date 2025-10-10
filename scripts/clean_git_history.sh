#!/usr/bin/env bash
#
# clean_git_history.sh
# 用于清理指定文件的历史提交记录，但保留当前版本
#
# 使用示例：
#   ./clean_git_history.sh account/sql/schema_pglogical_region_cn.sql account/sql/schema_pglogical_region_global.sql
#

set -euo pipefail

# ==============================
# 1️⃣ 参数检查
# ==============================
if [ "$#" -lt 1 ]; then
  echo "❌ 用法: $0 <file1> [file2 ...]"
  exit 1
fi

# ==============================
# 2️⃣ 备份远程配置
# ==============================
REMOTE_URL=$(git remote get-url origin)
echo "🧭 当前远程仓库: $REMOTE_URL"
echo "📦 正在备份远程配置..."
echo "$REMOTE_URL" > .git/remote_backup.url

# ==============================
# 3️⃣ 暂存当前文件内容
# ==============================
TMP_DIR=$(mktemp -d)
echo "📂 临时保存当前版本到: $TMP_DIR"
for FILE in "$@"; do
  if [ -f "$FILE" ]; then
    mkdir -p "$TMP_DIR/$(dirname "$FILE")"
    cp "$FILE" "$TMP_DIR/$FILE"
    echo "✅ 已备份当前版本: $FILE"
  else
    echo "⚠️ 警告: 文件不存在 $FILE"
  fi
done

# ==============================
# 4️⃣ 执行历史清理
# ==============================
echo "🧹 正在清理历史记录 (使用 git-filter-repo)..."
sleep 2
git filter-repo --invert-paths $(for f in "$@"; do echo --path "$f"; done) --force

# ==============================
# 5️⃣ 恢复远程配置
# ==============================
git remote remove origin || true
git remote add origin "$REMOTE_URL"
echo "🔗 已恢复远程配置: $REMOTE_URL"

# ==============================
# 6️⃣ 恢复文件并提交
# ==============================
echo "♻️ 恢复当前版本的文件..."
for FILE in "$@"; do
  mkdir -p "$(dirname "$FILE")"
  cp "$TMP_DIR/$FILE" "$FILE" 2>/dev/null || true
done

git add "$@"
git commit -m "chore: re-add cleaned files after history purge"

# ==============================
# 7️⃣ 推送并覆盖远程
# ==============================
echo "🚀 推送变更并覆盖远程历史..."
git push origin --force --all
git push origin --force --tags

# ==============================
# 8️⃣ 清理临时文件
# ==============================
rm -rf "$TMP_DIR"
echo "🧽 清理完成，临时目录已删除。"

# ==============================
# 9️⃣ 提示用户
# ==============================
echo
echo "✅ 已完成历史清理。"
echo "请检查文件是否恢复正确，然后执行:"
echo "   git log -- <file>"
echo "以确认历史提交已被清空。"

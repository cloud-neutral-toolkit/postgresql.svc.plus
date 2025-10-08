#!/usr/bin/env bash
# =============================================
# 🧹 git-branch-keeper.sh
# 保留 main 与所有 release/* 分支
# 清理多余本地和远程分支
# =============================================

set -e

echo ">>> Fetching and pruning remote branches..."
git fetch --all --prune

echo ">>> Cleaning local branches..."
for branch in $(git branch | sed 's/*//'); do
  case "$branch" in
    main|HEAD|release/*)
      echo "✅ 保留本地分支：$branch"
      ;;
    *)
      echo "🗑️ 删除本地分支：$branch"
      git branch -D "$branch"
      ;;
  esac
done

echo ">>> Cleaning remote branches..."
for branch in $(git branch -r | sed 's/origin\///'); do
  case "$branch" in
    HEAD|main|release/*)
      echo "✅ 保留远程分支：origin/$branch"
      ;;
    *)
      echo "🗑️ 删除远程分支：origin/$branch"
      git push origin --delete "$branch" || true
      ;;
  esac
done

echo "✅ 分支清理完成！"


#!/usr/bin/env bash
set -euo pipefail

FROM_TAG=${1:-""}
TO_TAG=${2:-"HEAD"}

# 检查 FROM_TAG
if [[ -n "$FROM_TAG" ]] && ! git rev-parse "$FROM_TAG" >/dev/null 2>&1; then
  echo "❌ Error: tag $FROM_TAG not found" >&2
  exit 1
fi

# 检查 TO_TAG
if ! git rev-parse "$TO_TAG" >/dev/null 2>&1; then
  echo "⚠️  Tag $TO_TAG not found, using HEAD instead" >&2
  TO_TAG=HEAD
fi

# 生成 changelog 内容
CONTENT=$(cat <<EOF
## Changelog $FROM_TAG → $TO_TAG

### 👥 Contributors
$(git log --pretty=format:"- %an" $FROM_TAG..$TO_TAG | sort -u || echo "- (none)")

### ✨ Features / Changes
$(git log --pretty=format:"- %s" $FROM_TAG..$TO_TAG | grep -E "^(feat|fix|chore|refactor|docs|perf)" || echo "- (no major feature commits)")

### 📦 Others
$(git log --pretty=format:"- %s" $FROM_TAG..$TO_TAG | grep -vE "^(feat|fix|chore|refactor|docs|perf)" || echo "- (none)")
EOF
)

# 打印到终端
echo "$CONTENT"

# 如果在 CI 中，写入 docs/changelog_<ref>.md
if [[ -n "${GITHUB_REF_NAME:-}" ]]; then
  mkdir -p docs
  OUTFILE="docs/changelog_${GITHUB_REF_NAME}.md"
  echo "$CONTENT" > "$OUTFILE"
  echo "✅ changelog written to $OUTFILE"
fi

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTENT_DIR="${REPO_ROOT}/content"

if [[ ! -d "${CONTENT_DIR}" ]]; then
  echo "[sync-content] content directory not found at ${CONTENT_DIR}" >&2
  exit 1
fi

if [[ -z "${CONTENT_REPO_URL:-}" ]]; then
  echo "[sync-content] CONTENT_REPO_URL environment variable is required" >&2
  exit 1
fi

TARGET_BRANCH="${CONTENT_REPO_BRANCH:-main}"
WORKDIR="${CONTENT_SYNC_WORKDIR:-$(mktemp -d)}"

cleanup() {
  if [[ -z "${CONTENT_SYNC_WORKDIR:-}" && -d "${WORKDIR}" ]]; then
    rm -rf "${WORKDIR}"
  fi
}
trap cleanup EXIT

echo "[sync-content] Cloning ${CONTENT_REPO_URL} (branch ${TARGET_BRANCH})"
if git clone --depth 1 --branch "${TARGET_BRANCH}" "${CONTENT_REPO_URL}" "${WORKDIR}"; then
  echo "[sync-content] Repository cloned into ${WORKDIR}"
else
  echo "[sync-content] Failed to clone repository" >&2
  exit 1
fi

mkdir -p "${WORKDIR}/content"
rsync -av --delete "${CONTENT_DIR}/" "${WORKDIR}/content/"

pushd "${WORKDIR}" >/dev/null
if [[ -n "${CONTENT_REPO_SUBDIR:-}" ]]; then
  mkdir -p "${CONTENT_REPO_SUBDIR}"
  rsync -av --delete "content/" "${CONTENT_REPO_SUBDIR}/"
  pushd "${CONTENT_REPO_SUBDIR}" >/dev/null
fi

if [[ -z "$(git status --porcelain)" ]]; then
  echo "[sync-content] No changes detected, skipping commit"
  popd >/dev/null 2>&1 || true
  popd >/dev/null 2>&1 || true
  exit 0
fi

git config user.name "${GIT_AUTHOR_NAME:-Content Sync Bot}"
git config user.email "${GIT_AUTHOR_EMAIL:-content-sync@example.com}"

git add .
COMMIT_MESSAGE="chore: sync content from XControl $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

git commit -m "${COMMIT_MESSAGE}"
git push origin "${TARGET_BRANCH}"

echo "[sync-content] Content synchronized successfully"

if [[ -n "${CONTENT_REPO_SUBDIR:-}" ]]; then
  popd >/dev/null || true
fi
popd >/dev/null || true

#!/usr/bin/env bash
set -euo pipefail

PG_MAJOR="${PG_MAJOR:-16}"
ARCH=$(uname -m)
DISTRO=$(lsb_release -cs)

# -----------------------------------------------------------------------------
# 通用函数
# -----------------------------------------------------------------------------
fix-apt-keys() {
    echo "🔑 修复 GPG keyring 路径..."
    sudo mkdir -p /usr/share/keyrings /etc/apt/keyrings
}

install-go() {
    local version="${GO_VERSION:-1.24.5}"
    local arch_map
    case "$ARCH" in
      x86_64|amd64) arch_map="amd64" ;;
      arm64|aarch64) arch_map="arm64" ;;
      *) echo "❌ 不支持的架构 $ARCH"; exit 1 ;;
    esac

    local tarball="go${version}.linux-${arch_map}.tar.gz"
    local url="https://go.dev/dl/${tarball}"
    echo "=== 安装 Go ${version} (${arch_map}) ==="
    wget -q --show-progress "$url" -O "$tarball"
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf "$tarball"
    echo 'export PATH=$PATH:/usr/local/go/bin' | sudo tee /etc/profile.d/go.sh >/dev/null
    export PATH=$PATH:/usr/local/go/bin
    go version
    rm -f "$tarball"
}

install-nodejs() {
    echo "=== 安装 Node.js（通用二进制） ==="

    local NODE_MAJOR="${NODE_MAJOR:-22}"
    local ARCH
    ARCH=$(uname -m)
    local PLATFORM="linux"
    local NODE_ARCH

    case "$ARCH" in
      x86_64|amd64) NODE_ARCH="x64" ;;
      aarch64|arm64) NODE_ARCH="arm64" ;;
      *)
        echo "❌ 不支持的架构: $ARCH"
        exit 1
        ;;
    esac

    # 从 Node 官方 API 获取最新版本号
    echo "📡 检测 Node.js ${NODE_MAJOR}.x 最新版本..."
    local VERSION
    VERSION=$(curl -sL "https://nodejs.org/dist/index.json" | grep -Eo "\"v${NODE_MAJOR}\.[0-9]+\.[0-9]+\"" | head -n1 | tr -d '"')
    if [ -z "$VERSION" ]; then
        echo "❌ 无法获取 Node ${NODE_MAJOR}.x 最新版本号"
        exit 1
    fi
    echo "📦 准备安装 Node.js ${VERSION} (${PLATFORM}-${NODE_ARCH})"

    local TARBALL="node-${VERSION}-${PLATFORM}-${NODE_ARCH}.tar.xz"
    local URL="https://nodejs.org/dist/${VERSION}/${TARBALL}"

    # 下载与安装
    curl -fSL "$URL" -o "/tmp/${TARBALL}"
    local PREFIX="/usr/local/node-${VERSION}"
    sudo rm -rf "$PREFIX"
    sudo mkdir -p "$PREFIX"
    sudo tar -xJf "/tmp/${TARBALL}" -C "$PREFIX" --strip-components=1
    rm -f "/tmp/${TARBALL}"

    # 链接到系统路径
    sudo ln -sf "${PREFIX}/bin/node" /usr/local/bin/node
    sudo ln -sf "${PREFIX}/bin/npm" /usr/local/bin/npm
    sudo ln -sf "${PREFIX}/bin/npx" /usr/local/bin/npx
    sudo ln -sf "${PREFIX}/bin/corepack" /usr/local/bin/corepack

    # 启用 Corepack（Yarn、pnpm）
    corepack enable || true
    corepack prepare yarn@stable --activate || true

    echo "✅ Node.js 安装完成: $(node -v)"
    echo "   npm: $(npm -v)"
    echo "   Yarn: $(yarn -v || echo '未启用')"
}

install-postgresql() {
    echo "=== 安装 PostgreSQL ${PG_MAJOR} ==="

    # 安装依赖
    sudo apt-get update -y
    sudo apt-get install -y wget curl gnupg lsb-release ca-certificates

    # 修复 GPG key 路径
    sudo mkdir -p /usr/share/keyrings /etc/apt/keyrings

    # 添加 PostgreSQL 官方仓库
    if [ ! -f /usr/share/keyrings/postgresql.gpg ]; then
        echo "📦 添加 PostgreSQL 官方仓库..."
        curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
            | sudo gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
    fi

    local DISTRO
    DISTRO=$(lsb_release -cs)
    echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] \
http://apt.postgresql.org/pub/repos/apt ${DISTRO}-pgdg main" \
        | sudo tee /etc/apt/sources.list.d/pgdg.list >/dev/null

    # 安装 PostgreSQL
    sudo apt-get update -y
    sudo apt-get install -y \
        "postgresql-${PG_MAJOR}" \
        "postgresql-client-${PG_MAJOR}" \
        "postgresql-contrib-${PG_MAJOR}" \
        "postgresql-server-dev-${PG_MAJOR}"

    # 启动并设置开机自启
    sudo systemctl enable --now postgresql

    # 显示版本与状态
    echo "✅ PostgreSQL 安装完成: $(psql --version)"
    sudo -u postgres psql -c "SELECT version();" || true
}

install-redis() {
    echo "=== 安装 Redis ==="
    sudo apt-get update
    sudo apt-get install -y redis-server
    sudo systemctl enable --now redis-server
}

install-pgvector() {
    echo "=== 安装 pgvector (源码) ==="
    sudo apt-get install -y git make gcc
    tmp_dir=$(mktemp -d)
    cd "$tmp_dir"
    git clone https://github.com/pgvector/pgvector.git
    cd pgvector
    make && sudo make install
    cd /
    rm -rf "$tmp_dir"
}

install-pgjieba() {
    echo "=== 安装 pg_jieba (替代 zhparser + scws) ==="
    sudo apt-get update -y
    sudo apt-get install -y cmake g++ git postgresql-server-dev-${PG_MAJOR}

    tmp_dir=$(mktemp -d)
    cd "$tmp_dir"

    # 克隆仓库
    git clone https://github.com/jaiminpan/pg_jieba.git
    cd pg_jieba

    # 创建构建目录
    mkdir build && cd build
    cmake -DPostgreSQL_TYPE_INCLUDE_DIR=/usr/include/postgresql/${PG_MAJOR}/server ..
    make -j"$(nproc)"
    sudo make install

    cd /
    rm -rf "$tmp_dir"

    echo "✅ pg_jieba 安装完成"
    echo "可在 PostgreSQL 中启用：CREATE EXTENSION pg_jieba;"
}

# -----------------------------------------------------------------------------
# 调度入口
# -----------------------------------------------------------------------------
if declare -f "$1" > /dev/null; then
    "$1"
else
    echo "用法: $0 {install-go|install-nodejs|install-postgresql|install-redis|install-pgvector|install-pgjieba}"
    exit 1
fi

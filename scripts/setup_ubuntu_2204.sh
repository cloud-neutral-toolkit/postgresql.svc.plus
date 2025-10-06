#!/usr/bin/env bash
set -euo pipefail

install-go() {
    local version="${GO_VERSION:-1.24.5}"
    local tarball="go${version}.linux-amd64.tar.gz"
    local url="https://go.dev/dl/${tarball}"

    echo "=== 安装 Go ${version} (linux/amd64) ==="

    # 1. 下载 Go 安装包
    echo "下载 ${url} ..."
    if ! wget -q --show-progress "$url" -O "$tarball"; then
        echo "❌ 无法下载 Go 安装包，请检查网络"
        exit 1
    fi

    # 2. 删除旧版本（如果有）
    if [ -d /usr/local/go ]; then
        echo "移除旧版本 Go..."
        sudo rm -rf /usr/local/go
    fi

    # 3. 解压到 /usr/local
    echo "解压到 /usr/local ..."
    sudo tar -C /usr/local -xzf "$tarball"

    # 4. 配置环境变量（全局）
    echo "配置全局 PATH ..."
    echo 'export PATH=$PATH:/usr/local/go/bin' | sudo tee /etc/profile.d/go.sh >/dev/null
    sudo chmod +x /etc/profile.d/go.sh

    # 5. 立即生效（当前终端）
    export PATH=$PATH:/usr/local/go/bin

    # 6. 验证安装
    if go version >/dev/null 2>&1; then
        echo "✅ Go 安装成功: $(go version)"
    else
        echo "❌ Go 安装失败，请检查"
        exit 1
    fi

    # 清理 tar.gz
    rm -f "$tarball"
}

install-nodejs() {
    set -euo pipefail
    # 选择 Node 主版本，默认 22（LTS）
    local NODE_MAJOR="${NODE_MAJOR:-22}"

    echo "=== 安装 Node.js ${NODE_MAJOR}.x（Ubuntu 22.04）==="
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg

    # NodeSource 官方仓库（更稳妥的 GPG 方式）
    sudo install -d -m 0755 /etc/apt/keyrings
    curl -fsSL --socks5-hostname 127.0.0.1:1080 \
	    https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
	    | sudo gpg --batch --yes --dearmor -o /etc/apt/keyrings/nodesource.gpg
    gpg --keyserver keyserver.ubuntu.com --recv-keys 2F59B5F99B1BE0B4
    gpg --export --armor 2F59B5F99B1BE0B4 | sudo tee /etc/apt/trusted.gpg.d/missing-key.gpg

    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
      | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null

    sudo apt-get update
    sudo apt-get install -y nodejs

    # 启用 Corepack，激活 Yarn（Berry）
    sudo corepack enable || true
    corepack prepare yarn@stable --activate || true

    # 版本校验
    local node_v
    node_v="$(node -v 2>/dev/null || true)"
    if [ -z "$node_v" ]; then
        echo "❌ Node 未安装成功"
        exit 1
    fi
    echo "Node: $node_v"
    echo "Yarn: $(yarn -v 2>/dev/null || echo '未启用（可忽略）')"

    # 要求 >= 20
    local major="${node_v#v}"
    major="${major%%.*}"
    if [ "$major" -lt 20 ]; then
        echo "❌ Node 主版本过低（$node_v），请设置 NODE_MAJOR=20 或以上后重试"
        exit 1
    fi

    echo "✅ Node.js 安装完成，满足 >=20"
}

install-postgresql() {
    echo "=== 安装 PostgreSQL 14 ==="
    sudo apt-get update
    sudo apt-get install -y wget curl gnupg lsb-release ca-certificates
    if ! grep -q "apt.postgresql.org" /etc/apt/sources.list.d/pgdg.list 2>/dev/null; then
        curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /tmp/pgdg.asc || \
        curl -fsSL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xB97B0E2D95A5761FB72B0C18ACCC4CF8" -o /tmp/pgdg.asc
        sudo gpg --dearmor -o /usr/share/keyrings/postgresql.gpg /tmp/pgdg.asc
        echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
            | sudo tee /etc/apt/sources.list.d/pgdg.list
        sudo apt-get update
    fi
    sudo apt-get install -y postgresql-14 postgresql-client-14 postgresql-contrib-14 postgresql-server-dev-14
    sudo systemctl enable --now postgresql
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
    git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git || \
    git clone https://ghproxy.com/https://github.com/pgvector/pgvector.git
    cd pgvector
    make && sudo make install
    cd /
    rm -rf "$tmp_dir"
}

install-zhparser() {
    echo "=== 安装 scws v1.2.3 + zhparser ==="
    sudo apt-get install -y automake autoconf libtool pkg-config

    # 编译安装 scws v1.2.3
    tmp_dir=$(mktemp -d)
    cd "$tmp_dir"
    git clone https://github.com/hightman/scws.git || \
    git clone https://ghproxy.com/https://github.com/hightman/scws.git
    cd scws

    # 修掉 automake 不兼容的注释
    sed -i '/^[[:space:]]*#/d' Makefile.am || true

    # 生成 configure
    if [ ! -f configure ]; then
        if [ -x ./autogen.sh ]; then
            ./autogen.sh
        else
            autoreconf -fi
        fi
    fi

    ./configure --prefix=/usr
    make -j"$(nproc)" && sudo make install
    cd /
    rm -rf "$tmp_dir"

    # 编译安装 zhparser
    tmp_dir=$(mktemp -d)
    cd "$tmp_dir"
    git clone https://github.com/amutu/zhparser.git || \
    git clone https://ghproxy.com/https://github.com/amutu/zhparser.git
    cd zhparser
    make SCWS_HOME=/usr PG_CONFIG=/usr/lib/postgresql/14/bin/pg_config
    sudo make install SCWS_HOME=/usr PG_CONFIG=/usr/lib/postgresql/14/bin/pg_config
    cd /
    rm -rf "$tmp_dir"
}

if declare -f "$1" > /dev/null; then
    "$1"
else
    echo "用法: $0 {install-postgresql|install-redis|install-pgvector|install-zhparser}"
    exit 1
fi

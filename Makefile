OS := $(shell uname -s)
SHELL := /bin/bash
O_BIN ?= /usr/local/go/bin
PG_MAJOR ?= 16
NODE_MAJOR ?= 22
ARCH := $(shell dpkg --print-architecture)
PG_DSN ?= postgres://shenlan:password@127.0.0.1:5432/xserver?sslmode=disable

export PATH := $(GO_BIN):$(PATH)

.PHONY: install install-openresty install-redis install-postgresql init-db \
build update-dashboard-manifests build-server build-dashboard \
start start-openresty start-server start-dashboard \
stop stop-server stop-dashboard stop-openresty restart lint-cms

# -----------------------------------------------------------------------------
# Dependency installation
# -----------------------------------------------------------------------------

install: install-nodejs install-go install-openresty install-redis install-postgresql

# --- Node.js ---------------------------------------------------------------
install-nodejs:
ifeq ($(OS),Darwin)
	( brew install node@22 && brew link --overwrite --force node@22 ) || brew install node
	corepack enable || true
	corepack prepare yarn@stable --activate || true
	@echo "✅ Node: $$(node -v)"; echo "✅ Yarn: $$(yarn -v 2>/dev/null || echo n/a)"
else
	@echo "🟦 Installing Node.js $(NODE_MAJOR) via setup_ubuntu_2204.sh..."
	NODE_MAJOR=$(NODE_MAJOR) bash scripts/setup_ubuntu_2204.sh install-nodejs
endif

# --- Go --------------------------------------------------------------------
install-go:
ifeq ($(OS),Darwin)
	brew install go
else
	GO_VERSION=$(GO_VERSION) bash scripts/setup_ubuntu_2204.sh install-go
endif

# --- OpenResty -------------------------------------------------------------
install-openresty:
	@echo "🚀 Installing OpenResty using external script..."
	@bash scripts/install-openresty.sh; \

# --- Redis -----------------------------------------------------------------
install-redis:
ifeq ($(OS),Darwin)
	brew install redis && brew services start redis
else
	@echo "🟥 Installing Redis via setup_ubuntu_2204.sh..."
	bash scripts/setup_ubuntu_2204.sh install-redis
endif

# --- PostgreSQL ------------------------------------------------------------
install-postgresql:
ifeq ($(OS),Darwin)
	@set -e; \
		echo "🍎 Installing PostgreSQL 16 via Homebrew..."; \
		brew install postgresql@16 || true; \
		brew services start postgresql@16; \
		echo "📦 Installing pgvector extension..."; \
		brew install pgvector || true; \
		echo "📦 Installing pg_jieba (替代 zhparser + scws)..."; \
		tmp_dir=$$(mktemp -d) && cd $$tmp_dir && \
			git clone --recursive https://github.com/jaiminpan/pg_jieba.git && \
			cd pg_jieba && mkdir build && cd build && \
			cmake -DPostgreSQL_TYPE_INCLUDE_DIR=$$(brew --prefix postgresql@16)/include/postgresql/server .. && \
			make -j$$(sysctl -n hw.ncpu) && sudo make install && \
			cd / && rm -rf $$tmp_dir; \
		echo "✅ PostgreSQL extensions installed successfully!"
else
	@set -e; \
		echo "🟨 Installing PostgreSQL 16..."; \
		bash scripts/setup_ubuntu_2204.sh install-postgresql; \
		echo "🟨 Installing pgvector extension..."; \
		bash scripts/setup_ubuntu_2204.sh install-pgvector; \
		echo "🟨 Installing pg_jieba extension (替代 zhparser + scws)..."; \
		tmp_dir=$$(mktemp -d) && cd $$tmp_dir && \
			sudo apt-get install -y cmake g++ git postgresql-server-dev-${PG_MAJOR}; \
			git clone --recursive https://github.com/jaiminpan/pg_jieba.git && \
			cd pg_jieba && mkdir build && cd build && \
			cmake -DPostgreSQL_TYPE_INCLUDE_DIR=/usr/include/postgresql/${PG_MAJOR}/server .. && \
			make -j$$(nproc) && sudo make install && \
			cd / && rm -rf $$tmp_dir; \
		echo "✅ PostgreSQL extensions installed successfully!"
endif

# -----------------------------------------------------------------------------
# Database initialization
# -----------------------------------------------------------------------------
init-db:
	@psql $(PG_DSN) -f rag-server/sql/schema.sql

# -----------------------------------------------------------------------------
# Build targets
# -----------------------------------------------------------------------------
build: update-dashboard-manifests build-cli build-server build-dashboard

build-cli:
	$(MAKE) -C rag-server/cmd/rag-server-cli build

build-server:
	$(MAKE) -C rag-server build

build-dashboard:
	$(MAKE) -C dashboard build SKIP_SYNC=1

update-dashboard-manifests:
	$(MAKE) -C dashboard sync-dl-index

# -----------------------------------------------------------------------------
# Run targets
# -----------------------------------------------------------------------------
start: start-openresty start-server start-dashboard

start-server:
	$(MAKE) -C rag-server start

start-dashboard:
	$(MAKE) -C dashboard start

stop: stop-server stop-dashboard stop-openresty

stop-server:
	$(MAKE) -C rag-server stop

stop-dashboard:
	$(MAKE) -C dashboard stop

start-openresty:
ifeq ($(OS),Darwin)
	@brew services start openresty >/dev/null 2>&1 || \
	( echo "Creating LaunchAgent for OpenResty..." && \
	  mkdir -p ~/Library/LaunchAgents && \
	  printf '%s\n' '<?xml version="1.0" encoding="UTF-8?>' \
		'<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' \
		'<plist version="1.0"><dict>' \
		'  <key>Label</key><string>homebrew.mxcl.openresty</string>' \
		'  <key>ProgramArguments</key>' \
		'  <array>' \
		'    <string>/opt/homebrew/openresty/nginx/sbin/nginx</string>' \
		'    <string>-g</string>' \
		'    <string>daemon off;</string>' \
		'  </array>' \
		'  <key>RunAtLoad</key><true/>' \
		'</dict></plist>' \
		> ~/Library/LaunchAgents/homebrew.mxcl.openresty.plist && \
	  brew services start ~/Library/LaunchAgents/homebrew.mxcl.openresty.plist )
else
	sudo systemctl enable --now openresty || echo "⚠️ openresty.service missing or inactive"
endif

stop-openresty:
ifeq ($(OS),Darwin)
	-brew services stop openresty >/dev/null 2>&1
else
	-sudo systemctl stop openresty >/dev/null 2>&1
endif

restart: stop start

# -----------------------------------------------------------------------------
# CMS configuration validation
# -----------------------------------------------------------------------------
lint-cms:
	python3 scripts/validate_cms_config.py

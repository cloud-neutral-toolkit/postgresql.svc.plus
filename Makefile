OS := $(shell uname -s)
SHELL := /bin/bash
O_BIN ?= /usr/local/go/bin
PG_DSN ?= postgres://shenlan:password@127.0.0.1:5432/xserver?sslmode=disable
NODE_MAJOR ?= 22

export PATH := $(GO_BIN):$(PATH)

.PHONY: install install-openresty install-redis install-postgresql init-db \
build update-dashboard-manifests build-server build-dashboard \
start start-openresty start-server start-dashboard \
stop stop-server stop-dashboard stop-openresty restart

# -----------------------------------------------------------------------------
# Dependency installation
# -----------------------------------------------------------------------------

install: install-nodejs install-go install-openresty install-redis install-postgresql

install-nodejs:
ifeq ($(OS),Darwin)
	# 尽量装新 LTS；若 node@22 不可用，可退回 brew install node
	( brew install node@22 && brew link --overwrite --force node@22 ) || brew install node
	# 启用 Corepack + Yarn
	corepack enable || true
	corepack prepare yarn@stable --activate || true
	@echo "Node: $$(node -v)"; echo "Yarn: $$(yarn -v 2>/dev/null || echo n/a)"
else
	@echo "Using setup_ubuntu_2204.sh to install Node.js..."
	NODE_MAJOR=$(NODE_MAJOR) bash scripts/setup_ubuntu_2204.sh install-nodejs
endif

install-go:
ifeq ($(OS),Darwin)
	brew install go
else
	GO_VERSION=$(GO_VERSION) bash scripts/setup_ubuntu_2204.sh install-go
endif

install-openresty:
ifeq ($(OS),Darwin)
	@[ -f install-openresty.sh ] && bash install-openresty.sh
else
	@echo "Detected Linux. Installing via apt..."
	sudo apt-get update && \
	sudo apt-get install -y openresty || echo "Please install OpenResty manually."
	@$(MAKE) start-openresty
endif

install-redis:
ifeq ($(OS),Darwin)
	brew install redis && brew services start redis
else
	@echo "Using setup_ubuntu_2204.sh to install Redis..."
	bash scripts/setup_ubuntu_2204.sh install-redis
endif

install-postgresql:
ifeq ($(OS),Darwin)
	brew install postgresql@16 && \
	brew services start postgresql@16 && \
	brew install pgvector && \
	brew install scws && \
	tmp_dir=$$(mktemp -d) && cd $$tmp_dir && \
	git clone https://github.com/amutu/zhparser.git && \
	cd zhparser && make SCWS_HOME=/opt/homebrew PG_CONFIG=$$(brew --prefix postgresql@16)/bin/pg_config && \
	sudo make install SCWS_HOME=/opt/homebrew PG_CONFIG=$$(brew --prefix postgresql@16)/bin/pg_config && \
	cd / && rm -rf $$tmp_dir
else
	@set -e; \
		echo "Using setup-ubuntu-2204.sh to install PostgreSQL 16..."; \
		bash scripts/setup_ubuntu_2204.sh install-postgresql; \
		echo "Using setup-ubuntu-2204.sh to install pgvector..."; \
		bash scripts/setup_ubuntu_2204.sh install-pgvector; \
		echo "Using setup-ubuntu-2204.sh to install zhparser..."; \
		bash scripts/setup_ubuntu_2204.sh install-zhparser
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

start: start-openresty start-server start-dashboard start-dl start-docs

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
	sudo systemctl enable --now openresty
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
.PHONY: lint-cms
lint-cms:
	python3 scripts/validate_cms_config.py

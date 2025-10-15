APP_NAME := xcontrol-server
MAIN_FILE := ../cmd/xcontrol-server/main.go
MODULE := xcontrol
PORT := 8090
OS := $(shell uname -s)
DB_URL ?= postgres://shenlan:password@127.0.0.1:5432/xserver?sslmode=disable
SCHEMA_FILE := sql/schema.sql
PSQL := psql "$(DB_URL)" -v ON_ERROR_STOP=1
export PATH := /usr/local/go/bin:$(PATH)

.PHONY: all build start stop restart clean init help dev test init-db reinit-db drop-db

all: build

init:
	@echo ">>> 初始化 Go 依赖环境"
	@if command -v go >/dev/null 2>&1; then \
	echo "Go 已安装"; \
	else \
	echo "安装 Go"; \
	if [ "$(OS)" = "Darwin" ]; then \
	brew install go@1.24 && brew link --overwrite --force go@1.24; \
	else \
	sudo apt-get update && sudo apt-get install -y golang; \
	fi; \
	fi
	@if curl -s --max-time 5 https://goproxy.cn >/dev/null; then \
	echo "使用国内镜像: goproxy.cn"; \
	go env -w GOPROXY=https://goproxy.cn,direct; \
	else \
	echo "国内镜像不可用，使用默认: proxy.golang.org"; \
	go env -w GOPROXY=https://proxy.golang.org,direct; \
	fi
	@echo ">>> 执行 go mod tidy"
	go mod tidy
	@echo ">>> 可选安装 air (开发热重载)"
	@echo "如需安装，请运行: go install github.com/air-verse/air@latest"

build:
	@echo ">>> 编译 $(APP_NAME)"
	go build -o $(APP_NAME) $(MAIN_FILE)

start:
	@echo ">>> 运行 $(APP_NAME) on port $(PORT) (后台运行)"
	@nohup env PORT=$(PORT) go run $(MAIN_FILE) > $(APP_NAME).log 2>&1 & echo $$! > $(APP_NAME).pid

stop:
	@echo ">>> 停止 $(APP_NAME)"
	@if [ -f $(APP_NAME).pid ]; then \
	        kill `cat $(APP_NAME).pid` >/dev/null 2>&1 || true; \
	        rm $(APP_NAME).pid; \
	else \
	        echo "未找到运行中的进程"; \
	fi

restart: stop start

test:
	@echo ">>> 运行单元测试"
	go test ./...

dev:
	@echo ">>> 开发模式运行 $(APP_NAME) (热重载) on port $(PORT)"
	@if command -v air >/dev/null; then \
		PORT=$(PORT) air -c .air.toml; \
	else \
		echo "未检测到 air，直接运行 go run"; \
		PORT=$(PORT) go run $(MAIN_FILE); \
	fi

clean:
        @echo ">>> 清理构建产物"
        rm -f $(APP_NAME)

init-db:
        @echo ">>> 初始化 RAG schema ($(SCHEMA_FILE))"
        @$(PSQL) -f $(SCHEMA_FILE)

drop-db:
        @echo ">>> 删除 RAG schema 对象"
        @$(PSQL) -c "DROP TABLE IF EXISTS public.documents CASCADE;"

reinit-db: drop-db init-db

help:
        @echo " XControl Server Makefile"
        @echo ""
        @echo "make build     编译 server 可执行文件"
        @echo "make start     后台运行 server (默认端口: $(PORT))"
        @echo "make stop      停止运行 server"
        @echo "make restart   重启 server"
        @echo "make test      运行单元测试"
        @echo "make dev       开发模式运行 (自动检测 air，如无则用 go run)"
        @echo "make init      初始化依赖（自动选择国内/默认 Go 模块代理，air 可选）"
        @echo "make clean     清理构建产物"
        @echo "make init-db   初始化数据库 schema ($(SCHEMA_FILE))"
        @echo "make drop-db   删除 RAG 相关数据库对象"
        @echo "make reinit-db 重置数据库 schema (drop + init)"

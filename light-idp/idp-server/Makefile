APP_NAME := idp-server
MAIN_FILE := cmd/idp-server/main.go
PORT := 8080

.PHONY: build start stop restart clean help

build:
	go build -o $(APP_NAME) $(MAIN_FILE)

start:
	nohup env PORT=$(PORT) go run $(MAIN_FILE) > $(APP_NAME).log 2>&1 & echo $$! > $(APP_NAME).pid

stop:
	pkill -f $(APP_NAME) >/dev/null 2>&1 || true

restart: stop start

clean:
	rm -f $(APP_NAME) $(APP_NAME).pid $(APP_NAME).log

help:
	@echo "make build    编译 idp-server"
	@echo "make start    启动 idp-server"
	@echo "make stop     停止 idp-server"
	@echo "make restart  重启 idp-server"
	@echo "make clean    清理构建产物"

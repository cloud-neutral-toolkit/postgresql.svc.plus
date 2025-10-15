APP_NAME := xcontrol-cli
MAIN_FILE := main.go
export PATH := /usr/local/go/bin:$(PATH)

.PHONY: build run clean

build:
	go build -o $(APP_NAME) $(MAIN_FILE)

run:
	go run $(MAIN_FILE)

clean:
	rm -f $(APP_NAME)


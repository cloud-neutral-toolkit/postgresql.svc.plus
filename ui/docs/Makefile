SHELL := /bin/bash
NODE_VERSION := $(shell node -v 2>/dev/null || echo "Not Found")
YARN := $(shell command -v yarn 2>/dev/null)
MAGICK := $(shell command -v magick 2>/dev/null || command -v convert 2>/dev/null)
OS := $(shell uname -s)

.PHONY: init dev build export clean info icon start stop restart test

icon:
	@echo "🎨 Generating favicon and icon images..."
	@if [ -z "$(MAGICK)" ]; then \
		echo "❌ ImageMagick not found."; \
		if [ "$(OS)" = "Darwin" ]; then \
			echo "👉 Try: brew install imagemagick"; \
		elif [ -f /etc/debian_version ]; then \
			echo "👉 Try: sudo apt install imagemagick"; \
		elif [ -f /etc/redhat-release ]; then \
			echo "👉 Try: sudo dnf install imagemagick"; \
		fi; \
		exit 1; \
	fi
	@mkdir -p public/icons
	@$(MAGICK) ../logo.png -resize 32x32 public/icons/cloudnative_32.png
	@$(MAGICK) ../logo.png -resize 64x64 -background none -define icon:auto-resize=64,48,32,16 public/favicon.ico
	@echo "✅ Icons generated successfully."

init:
	@echo "🔧 Installing dependencies for docs..."
	@if [ -z "$(YARN)" ]; then \
		echo "⚠️  Yarn not found. Attempting to install..."; \
		if [ "$(OS)" = "Darwin" ]; then \
			if command -v brew >/dev/null 2>&1; then \
				brew install yarn; \
			else \
				echo "❌ Homebrew not found. Please install Yarn manually."; exit 1; \
			fi; \
		elif [ -f /etc/debian_version ]; then \
			curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - && \
			echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list && \
			sudo apt update && sudo apt install -y yarn; \
		elif [ -f /etc/redhat-release ]; then \
			curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo && \
			sudo yum install -y yarn; \
		else \
			echo "❌ Unsupported OS. Please install Yarn manually."; exit 1; \
		fi; \
	fi
	yarn install

dev:
	@echo "🚀 Starting Next.js dev server (docs)..."
	yarn next dev -p 3003

start:
	@echo "🚀 Starting Next.js dev server (docs) in background..."
	@nohup yarn next dev -p 3003 >/tmp/docs.log 2>&1 & echo $$! > docs.pid

stop:
	@echo "🛑 Stopping Next.js dev server (docs)..."
	@if [ -f docs.pid ]; then \
	        kill `cat docs.pid` >/dev/null 2>&1 || true; \
	        rm docs.pid; \
	else \
	        echo "No running server"; \
	fi

restart: stop start

test:
	@echo "🔍 Running tests..."
	@yarn test || echo "No tests configured"

build: init
	yarn config set npmRegistryServer https://registry.npmmirror.com
	@echo "🔨 Building docs..."
	yarn next build

export:
	@echo "📦 Exporting docs static site to ./out ..."
	yarn next export

clean:
	@echo "🧹 Cleaning .next and out directories..."
	rm -rf .next out

info:
	@echo "🧾 Node.js version: $(NODE_VERSION)"


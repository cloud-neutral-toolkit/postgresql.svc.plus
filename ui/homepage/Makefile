SHELL := /bin/bash
NODE_VERSION := $(shell node -v 2>/dev/null || echo "Not Found")
YARN := $(shell command -v yarn 2>/dev/null)
MAGICK := $(shell command -v magick 2>/dev/null || command -v convert 2>/dev/null)
OS := $(shell uname -s)

.PHONY: init dev build export clean info icon start stop restart test sync-dl-index

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
	@echo "🔧 Installing dependencies for homepage..."
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
	@echo "🚀 Starting Next.js dev server (homepage)..."
	yarn dev -p 3001

start:
	@echo "🚀 Starting Next.js dev server (homepage) in background..."
	@nohup yarn dev -p 3001 >/tmp/homepage.log 2>&1 & echo $$! > homepage.pid

stop:
	@echo "🛑 Stopping Next.js dev server (homepage)..."
	@if [ -f homepage.pid ]; then \
	        kill `cat homepage.pid` >/dev/null 2>&1 || true; \
	        rm homepage.pid; \
	else \
	        echo "No running server"; \
	fi

restart: stop start

test:
	@echo "🔍 Running tests..."
	@yarn test || echo "No tests configured"

build: init
	yarn config set npmRegistryServer https://registry.npmmirror.com
	@if [ -z "$(SKIP_SYNC)" ]; then \
		$(MAKE) sync-dl-index; \
		fi
	@echo "🔨 Building homepage..."
	yarn next build

sync-dl-index:
	@echo "📥 Fetching download & docs manifests..."
	@mkdir -p public/dl-index
	@if ! curl -fsSL https://dl.svc.plus/manifest.json -o public/dl-index/artifacts-manifest.json; then \
            echo "⚠️  Unable to download artifacts manifest. Using existing snapshot."; \
			fi
	@if ! curl -fsSL https://dl.svc.plus/docs/all.json -o public/dl-index/docs-manifest.json; then \
            echo "⚠️  Unable to download docs manifest. Using existing snapshot."; \
    fi

export:
	@echo "📦 Exporting homepage static site to ./out ..."
	@NEXT_SHOULD_EXPORT=true yarn next export

clean:
	@echo "🧹 Cleaning .next and out directories..."
	rm -rf .next out

info:
	@echo "🧾 Node.js version: $(NODE_VERSION)"


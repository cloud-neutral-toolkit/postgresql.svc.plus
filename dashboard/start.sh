#!/bin/bash

cd /var/www/XControl/dashboard

## 1. 添加 NodeSource 仓库
#curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 2. 安装 Node.js 和 npm
sudo apt install -y nodejs

# 安装生产依赖（跳过 devDependencies）
npm install --omit=dev --registry=https://registry.npmmirror.com
npm install -g yarn --registry=https://registry.npmmirror.com
# 构建项目
/usr/bin/npm run build --registry=https://registry.npmmirror.com

# 启动 Next.js 生产服务器
/usr/bin/npm start


# -----------------------------------------------------------------------------
# Linux installation (no repo, curl source)
# -----------------------------------------------------------------------------
if [[ "$OS" == "Linux" ]]; then
  echo "🐧 Installing on Linux ($OPENRESTY_ARCH)..."

  # 1️⃣ 安装必要依赖
  echo "📦 Installing build dependencies..."
  sudo apt-get update -y
  sudo apt-get install -y build-essential libpcre3 libpcre3-dev zlib1g-dev libssl-dev perl curl tar

  # 2️⃣ 检查内存（若小于2GB则添加swap）
  MEM_TOTAL=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
  if [ "$MEM_TOTAL" -lt 2097152 ]; then
    echo "⚠️ Memory less than 2GB, adding 1GB swap..."
    sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi

  # 3️⃣ 下载源码
  VERSION=$(curl -s https://openresty.org/en/download.html | grep -Eo 'openresty-[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -n 1 | cut -d'-' -f2)
  URL="https://openresty.org/download/openresty-${VERSION}.tar.gz"

  echo "📦 Downloading OpenResty v${VERSION}..."
  curl -fSL "$URL" -o /tmp/openresty.tar.gz

  echo "📂 Extracting..."
  cd /tmp
  tar -xzf openresty.tar.gz
  cd "openresty-${VERSION}"

  # 4️⃣ 编译配置
  echo "⚙️ Configuring and building..."
  ./configure \
    --prefix=/usr/local/openresty \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-stream \
    --with-stream_ssl_module \
    --with-threads

  # 5️⃣ 编译与安装
  make -j"${CORES}" || { echo "❌ Build failed, trying single-threaded build..."; make; }
  sudo make install

  # 6️⃣ 校验安装结果
  if [ ! -x /usr/local/openresty/nginx/sbin/nginx ]; then
    echo "❌ OpenResty binary not found after install."
    exit 1
  fi

  # 7️⃣ systemd 服务
  echo "⚙️ Setting up systemd service..."
  sudo tee /lib/systemd/system/openresty.service >/dev/null <<'EOF'
[Unit]
Description=OpenResty Web Server
After=network.target

[Service]
Type=forking
PIDFile=/usr/local/openresty/nginx/logs/nginx.pid
ExecStart=/usr/local/openresty/nginx/sbin/nginx
ExecReload=/usr/local/openresty/nginx/sbin/nginx -s reload
ExecStop=/usr/local/openresty/nginx/sbin/nginx -s quit
PrivateTmp=true
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable --now openresty
  sudo systemctl status openresty --no-pager || true

  echo "✅ OpenResty v${VERSION} installed successfully on Linux"
  exit 0
fi

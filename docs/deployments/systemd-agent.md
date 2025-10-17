# Systemd Agent Deployment

For single-node setup with systemd.

工具支持

工具/机制       用途
grpcurl 采集 代理节点 流量
embed.FS        嵌入 Vue 前端页面至 Go 二进制
x25519  Reality 公钥/私钥生成
docker-compose  本地开发部署
helm    K8s 生产部署（节点 + PG + 控制器

## Nginx 配置

Systemd 部署通常只有一台主机，可按需选择动态或静态策略：

### 动态渲染（Node.js 代理）

```nginx
server {
  listen 80;
  server_name www.svc.plus cn-homepage.svc.plus;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name www.svc.plus cn-homepage.svc.plus;

  ssl_certificate     /etc/ssl/svc.plus.pem;
  ssl_certificate_key /etc/ssl/svc.plus.rsa.key;
  ssl_protocols       TLSv1.2 TLSv1.3;
  ssl_ciphers         HIGH:!aNULL:!MD5;

  location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location = /api/askai {
    access_by_lua_block {
      local redis = require "resty.redis"
      local r = redis:new()
      r:set_timeout(200)
      local ok, err = r:connect("127.0.0.1", 6379)
      if not ok then
        ngx.log(ngx.ERR, "Redis connect error: ", err)
        return ngx.exit(500)
      end

      local user = ngx.var.arg_user or ngx.var.remote_addr
      local today = os.date("%Y%m%d")
      local key = "limit:user:" .. user .. ":" .. today

      local count, err = r:incr(key)
      if count == 1 then r:expire(key, 86400) end
      if count > 200 then
        ngx.status = 429
        ngx.header["Content-Type"] = "text/plain; charset=utf-8"
        ngx.say("Too Many Requests: daily limit reached")
        return ngx.exit(429)
      end
    }

    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location ^~ /_next/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
  }

  location /favicon.ico {
    proxy_pass http://127.0.0.1:3000;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location ~ /\. {
    deny all;
  }
}
```

### 静态导出（无 Node 依赖）

```nginx
server {
  listen 80;
  server_name cn-homepage.svc.plus;
  return 301 https://cn-homepage.svc.plus$request_uri;
}

server {
  listen 443 ssl http2;
  server_name cn-homepage.svc.plus;

  ssl_certificate /etc/ssl/svc.plus.pem;
  ssl_certificate_key /etc/ssl/svc.plus.rsa.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  root /var/www/XControl/dashboard/out;
  index index.html;

  error_page 404 /404/index.html;
  error_page 500 502 503 504 /500/index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?)$ {
    expires 30d;
    access_log off;
    add_header Cache-Control "public";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location ~ /\. {
    deny all;
  }
}

server {
  listen 443 ssl http2;
  server_name artifact.svc.plus;

  ssl_certificate /etc/ssl/svc.plus.pem;
  ssl_certificate_key /etc/ssl/svc.plus.rsa.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  root /data/update-server;
  index index.html;

  autoindex on;
  autoindex_exact_size off;
  autoindex_localtime on;

  location / {
    add_header Accept-Ranges bytes;
    try_files $uri $uri/ =404;
  }

  location ~* \.(dmg|zip|tar\.gz|deb|rpm|exe|pkg|AppImage|apk|ipa)$ {
    expires 7d;
    access_log off;
    add_header Cache-Control "public";
    add_header Accept-Ranges bytes;
    try_files $uri =404;
  }

  location ~ /\. {
    deny all;
  }
}
```


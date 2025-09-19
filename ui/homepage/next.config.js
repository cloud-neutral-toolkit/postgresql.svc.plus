/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',             // 直接生成静态文件，便于部署到 S3 / Nginx
  trailingSlash: true,
  reactStrictMode: true,
  compress: false,              // 压缩交给 Nginx，省 Node CPU
  images: { unoptimized: true },// 关闭服务端图片处理
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*', // 后端服务
      },
    ]
  },
}

module.exports = nextConfig

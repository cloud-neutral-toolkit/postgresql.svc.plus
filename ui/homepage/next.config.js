/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',         // 生成最小可运行产物（适合 1c1G）
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

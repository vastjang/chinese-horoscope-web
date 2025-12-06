/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚨 关键：禁止 ESLint 在构建时阻断构建
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⚠ Cloudflare Pages 必须关闭 React Strict Mode，否则可能导致渲染差异
  reactStrictMode: false,

  // ⚠ 部署到 Cloudflare Pages 必须设置此项
  distDir: '.next',
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "",
  // Static export is only applied during production builds. In dev mode,
  // Next.js 14.2.5 has a bug where dynamic routes with output: 'export'
  // fail with "missing generateStaticParams" even when the function is
  // present. Gating on NODE_ENV gives a working dev server and an
  // unchanged production export (next build sets NODE_ENV=production).
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Omitir errores de ESLint en construcciones de producción
  experimental: {
    eslint: {
      ignoreDuringBuilds: true,
    },
  },
  /* config options here */
};

export default nextConfig;

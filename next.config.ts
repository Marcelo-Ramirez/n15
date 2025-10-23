import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deshabilitar completamente los overlays de desarrollo
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Configuración para deshabilitar el panel de desarrollo
  experimental: {
    // Deshabilitar el panel de desarrollo
    clientRouterFilter: false,
  },eslint: {
    ignoreDuringBuilds: true, // <--- esto deshabilita ESLint en build
  }
};

export default nextConfig;

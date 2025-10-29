import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический экспорт для деплоя на frontend хостинг
  output: 'export',
  // Конфигурация для Turbopack (Next.js 16)
  // Turbopack автоматически игнорирует серверные модули на клиенте
  turbopack: {},
  // Конфигурация для webpack (если будет использоваться с флагом --webpack)
  webpack: (config, { isServer }) => {
    // Игнорируем серверные модули qrcode на клиенте
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Игнорируем pngjs на клиенте, если qrcode пытается его использовать
      config.resolve.alias = {
        ...config.resolve.alias,
        pngjs: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;

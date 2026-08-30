/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Staging usa /staging sin modificar las URLs de producción.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  // Next no aplica basePath a todos los recursos de compilación; este prefijo
  // evita que staging solicite CSS y chunks desde la raíz de producción.
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
};

module.exports = nextConfig;

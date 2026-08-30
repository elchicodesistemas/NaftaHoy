/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Staging usa /staging sin modificar las URLs de producción.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

module.exports = nextConfig;

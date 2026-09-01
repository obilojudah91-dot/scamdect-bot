/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@telegram-bot/shared', '@telegram-bot/config'],
}

module.exports = nextConfig

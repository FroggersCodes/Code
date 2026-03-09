/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Code",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(isStaticExport
    ? {
        output: "export",
        basePath: "/Code",
      }
    : {}),
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/PGAT-N149",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

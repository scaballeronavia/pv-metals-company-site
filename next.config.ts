import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  reactStrictMode: true,
  transpilePackages: ["three"],
  agentRules: false,
};

export default nextConfig;

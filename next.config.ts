import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/arka-international-nyc" : "",
  assetPrefix: isGitHubPages ? "/arka-international-nyc" : "",
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
};

export default nextConfig;

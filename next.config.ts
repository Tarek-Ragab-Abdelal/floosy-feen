import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Base path for GitHub Pages (update with your repository name if needed)
  // basePath: '/your-repo-name',
};

export default nextConfig;

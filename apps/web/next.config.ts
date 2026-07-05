import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workflowguard/workflow-parser",
    "@workflowguard/scoring-engine",
    "@workflowguard/report-generator"
  ]
};

export default nextConfig;

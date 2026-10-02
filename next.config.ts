import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `npm run build` writes /out, deployable to any static host or Vercel.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactCompiler: true,
  // let devices on the LAN load the dev server's scripts (dev only; update if this machine's LAN address changes)
  allowedDevOrigins: ["192.168.1.48"],
};

export default nextConfig;

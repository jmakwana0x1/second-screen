/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: runs as a local file / Vercel / animated wallpaper URL.
  output: "export",
  images: { unoptimized: true },
  // Relative asset paths so the export works when opened from the filesystem
  // (e.g. mounted in Lively Wallpaper) rather than only from a web root.
  assetPrefix: "",
  reactStrictMode: true,
};

export default nextConfig;

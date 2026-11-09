import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // প্রোডাকশন ডেপ্লয়মেন্টে বিল্ড স্মুথ রাখতে
    ignoreBuildErrors: false,
  },
  eslint: {
    // বিল্ডের সময় লিন্ট ব্লকিং এড়াতে
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

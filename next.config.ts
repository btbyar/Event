import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These load model weights via `fs`/dynamic require at runtime rather than
  // static imports — keep them out of the server bundle so Turbopack doesn't
  // try to statically analyze/inline them.
  serverExternalPackages: ["@vladmandic/face-api", "@tensorflow/tfjs", "@tensorflow/tfjs-backend-wasm"],
};

export default nextConfig;

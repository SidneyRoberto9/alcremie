/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Next traces onnxruntime_binding.node but not the shared libs it dlopens,
  // so the tagger dies with "libonnxruntime.so.1: cannot open shared object file".
  // The CUDA/TensorRT providers are deliberately left out: inference is CPU-only.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime_providers_shared.so",
    ],
  },
  // The image runs on glibc; the musl builds of libvips are ~19MB of dead weight.
  outputFileTracingExcludes: {
    "/**": ["./node_modules/@img/sharp-libvips-linuxmusl-x64/**", "./node_modules/@img/sharp-linuxmusl-x64/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Next otherwise overwrites the repo's own CLAUDE.md with an
  // auto-generated agent-rules file on every `next dev`.
  agentRules: false,
}

export default nextConfig

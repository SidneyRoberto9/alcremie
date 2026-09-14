/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Next otherwise overwrites the repo's own CLAUDE.md with an
  // auto-generated agent-rules file on every `next dev`.
  agentRules: false,
}

export default nextConfig

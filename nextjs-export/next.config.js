/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "ui-avatars.com",
      "i.ibb.co",
      "placehold.co",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com",
    ],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;

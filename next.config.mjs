/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://www.youtube.com https://www.youtube.com/iframe_api https://www.googletagmanager.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://i.ytimg.com https://img.youtube.com",
              "connect-src 'self' https://raw.githubusercontent.com https://api.github.com",
              "font-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    let defaultBackend =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://tbi-homestay.onrender.com";

    let backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      defaultBackend;

    if (backendUrl.endsWith("/")) {
      backendUrl = backendUrl.slice(0, -1);
    }
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

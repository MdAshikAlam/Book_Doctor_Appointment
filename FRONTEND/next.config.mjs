/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: 'http://localhost:3001/dashboard',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: 'http://localhost:3001/dashboard/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

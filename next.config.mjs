/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
    domains: ['images.unsplash.com',"img.clerk.com","ik.imagekit.io"],
    // Alternatively, you can use remotePatterns for more control:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

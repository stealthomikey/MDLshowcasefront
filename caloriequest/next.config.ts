/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // This one is for your recipes from TheMealDB
      {
        protocol: 'https',
        hostname: 'www.themealdb.com',
        port: '',
        pathname: '/images/media/meals/**',
      },
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
        port: '',
        pathname: '/images/products/**',
      },
      // --- END OF NEW OBJECT ---
    ],
  },
};

export default nextConfig;
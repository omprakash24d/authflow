
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // Added for Firebase Storage
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // You might want to make the pathname more specific if you know your bucket structure,
        // e.g., pathname: '/v0/b/your-project-id.appspot.com/o/**',
        // For now, allowing broadly from this hostname.
        // It's generally better to specify the bucket directly in hostname if possible,
        // e.g. hostname: 'your-project-id.appspot.com' if that's where final URLs point.
        // However, firebasestorage.googleapis.com is the common domain for direct access.
        pathname: '/**',
      },
      // If your Firebase Storage URLs are in the format `your-project-id.appspot.com`
      // you would add another entry like this. Replace `your-project-id.appspot.com`
      // with your actual Firebase Storage bucket URL.
      // {
      //   protocol: 'https',
      //   hostname: 'your-project-id.appspot.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
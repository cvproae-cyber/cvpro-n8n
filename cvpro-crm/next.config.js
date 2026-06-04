/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
    // Note: We removed serverMinification as it was causing a '⨯' in your logs
    // and simplified the config for maximum stability on Vercel.
};

export default nextConfig;
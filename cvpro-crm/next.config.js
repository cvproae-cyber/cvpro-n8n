/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Help Vercel's tracer correctly map route groups and external dependencies
    serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
    skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
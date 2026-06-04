/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // يمنع تتبع الحزم التي تسبب تحذيرات في Edge Runtime
    serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr', '@tanstack/react-query', 'canvas', 'pdf-parse'],
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts'],
    },
    
    // Note: We removed serverMinification as it was causing a '⨯' in your logs
    // and simplified the config for maximum stability on Vercel.
};

export default nextConfig;
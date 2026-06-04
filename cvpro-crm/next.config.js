/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
    experimental: {
        serverMinification: false,
        // تحسين معالجة حزم الأيقونات والرسوم البيانية لتقليل حجم الـ Build
        optimizePackageImports: ['lucide-react', 'recharts'],
    },
};

export default nextConfig;
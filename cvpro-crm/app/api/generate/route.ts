import { serverCallGemini } from '@/lib/serverGemini';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const prompt = body?.prompt;
    const temperature = body?.temperature ?? 0.7;
    if (!prompt) return new Response(JSON.stringify({ error: 'missing prompt' }), { status: 400 });

    const text = await serverCallGemini(prompt, temperature);
    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err: any) {
    console.error('/api/generate error', err);
    return new Response(JSON.stringify({ error: err?.message || 'server error' }), { status: 500 });
  }
}

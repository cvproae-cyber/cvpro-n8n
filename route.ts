import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// إعداد عميل Supabase باستخدام Service Role لتجاوز الـ RLS عند تسجيل الحملة
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, channel, message } = body;

    // 1. التحقق من البيانات المطلوبة
    if (!name || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 2. تسجيل الحملة في جدول broadcasts في Supabase
    const { data: broadcast, error: dbError } = await supabase
      .from('broadcasts')
      .insert({
        name,
        channel,
        status: 'sending',
        sent_count: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 3. إرسال إشارة البدء إلى n8n Webhook
    // تأكد من إضافة N8N_BROADCAST_WEBHOOK_URL في ملف .env
    const n8nWebhookUrl = process.env.N8N_BROADCAST_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcast_id: broadcast.id,
          name,
          channel,
          message
        }),
      });
    }

    return NextResponse.json({ success: true, id: broadcast.id });
  } catch (error: any) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
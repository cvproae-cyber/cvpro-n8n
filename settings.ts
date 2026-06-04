'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// إعداد عميل Supabase للسيرفر (يستخدم Service Role لتخطي الـ RLS عند الحفظ)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getSystemSetting(key: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error) throw error
    return data?.value
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }
}

export async function updateSystemSetting(key: string, value: any) {
  try {
    const { error } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) throw error
    
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error)
    return { success: false, error }
  }
}
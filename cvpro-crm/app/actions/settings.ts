"use server";

import { createClient } from "@/lib/supabaseServer";

export async function getSystemSetting(key: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error("Failed to load system setting:", error);
    return null;
  }

  return data?.value ?? null;
}

export async function updateSystemSetting(key: string, value: unknown) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("system_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    console.error("Failed to update system setting:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

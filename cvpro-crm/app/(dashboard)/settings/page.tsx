"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [defaultAiMode, setDefaultAiMode] = useState<boolean>(true);
  const [message, setMessage] = useState("");

  // يمكنك حفظ الإعدادات في localStorage أو في جدول settings بالمستقبل
  useEffect(() => {
    const saved = localStorage.getItem("cvpro_default_ai_mode");
    if (saved !== null) setDefaultAiMode(saved === "true");
  }, []);

  const saveSettings = () => {
    localStorage.setItem("cvpro_default_ai_mode", String(defaultAiMode));
    setMessage("تم حفظ الإعدادات بنجاح");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
      <div className="bg-slate-800 p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">وضع الذكاء الاصطناعي الافتراضي</h3>
            <p className="text-slate-400 text-sm">عند فتح صفحة المحادثة، هل يتم تفعيل الرد الآلي تلقائياً؟</p>
          </div>
          <button
            onClick={() => setDefaultAiMode(!defaultAiMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              defaultAiMode ? "bg-blue-600" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                defaultAiMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-lg font-semibold mb-2">حول النظام</h3>
          <p className="text-slate-300">CVPro CRM – الإصدار 2.0</p>
          <p className="text-slate-400 text-sm">يعمل عبر n8n، Supabase، Gemini API</p>
        </div>

        <button onClick={saveSettings} className="bg-blue-600 px-6 py-2 rounded mt-4">
          حفظ التغييرات
        </button>
        {message && <div className="text-green-400 mt-2">{message}</div>}
      </div>
    </div>
  );
}
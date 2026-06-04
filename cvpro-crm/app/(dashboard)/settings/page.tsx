"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSystemSetting, updateSystemSetting } from "@/app/actions/settings";

export default function SettingsPage() {
  const [defaultAiMode, setDefaultAiMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      const value = await getSystemSetting('default_ai_mode');
      if (value !== null) {
        // بما أن القيمة JSONB، قد تأتي كـ string أو boolean
        setDefaultAiMode(value === true || value === "true");
      }
      setMounted(true);
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsLoading(true);
    const result = await updateSystemSetting('default_ai_mode', defaultAiMode);
    setIsLoading(false);
    
    if (result.success) {
      toast({ title: "تم الحفظ بنجاح", description: "تم تحديث إعدادات النظام في قاعدة البيانات." });
    } else {
      toast({ title: "خطأ في الحفظ", description: "تعذر الاتصال بقاعدة البيانات.", variant: "destructive" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-4xl space-y-6 flex-1 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام وتفضيلات الذكاء الاصطناعي.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>تفضيلات المحادثة</CardTitle>
          <CardDescription>تحكم في كيفية تفاعل الذكاء الاصطناعي مع العملاء بشكل افتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">وضع الذكاء الاصطناعي الافتراضي</h3>
              <p className="text-slate-400 text-sm">تفعيل الرد الآلي تلقائياً عند بدء محادثة جديدة.</p>
            </div>
            <button
              disabled={isLoading}
              onClick={() => setDefaultAiMode(!defaultAiMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
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

          <Separator className="bg-slate-800" />

          <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2">حول النظام</h3>
          <p className="text-slate-300">CVPro CRM – الإصدار 2.0</p>
          <p className="text-slate-400 text-sm">يعمل عبر n8n، Supabase، Gemini API</p>
        </div>

        <Button onClick={saveSettings} className="mt-4" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
        </CardContent>
      </Card>
    </div>
  );
}
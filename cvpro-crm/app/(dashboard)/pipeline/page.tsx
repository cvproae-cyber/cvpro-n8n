"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer } from "@/lib/types";

const stages = [
  { id: "new", name: "جديد", color: "bg-gray-700" },
  { id: "qualified", name: "مؤهل", color: "bg-blue-700" },
  { id: "analysis_done", name: "تم تحليل السيرة", color: "bg-indigo-700" },
  { id: "offer_sent", name: "تم إرسال العرض", color: "bg-yellow-700" },
  { id: "negotiation", name: "تفاوض", color: "bg-orange-700" },
  { id: "won", name: "تم التحويل", color: "bg-green-700" },
  { id: "lost", name: "فقد", color: "bg-red-700" },
];

export default function PipelinePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("buying_intent_score", { ascending: false });
    if (error) console.error(error);
    else setCustomers(data || []);
    setLoading(false);
  }

  async function moveCustomer(customerId: string, newStage: string) {
    await supabase.from("customers").update({ lead_stage: newStage }).eq("id", customerId);
    fetchCustomers();
  }

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">خط أنابيب المبيعات</h1>
      <div className="flex overflow-x-auto gap-4 pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="min-w-[280px] bg-slate-800 rounded-lg p-4">
            <h2 className={`text-lg font-bold mb-3 p-2 rounded ${stage.color}`}>{stage.name}</h2>
            <div className="space-y-2">
              {customers
                .filter((c) => (c.lead_stage || "new") === stage.id)
                .map((c) => (
                  <div key={c.id} className="bg-slate-700 p-3 rounded shadow">
                    <p className="font-semibold">{c.full_name || "بدون اسم"}</p>
                    <p className="text-xs text-slate-300">{c.phone_number || c.instagram_id}</p>
                    <p className="text-xs mt-1">درجة الاهتمام: {c.buying_intent_score || 0}</p>
                    <div className="flex justify-between mt-2 text-xs">
                      <select
                        value={c.lead_stage || "new"}
                        onChange={(e) => moveCustomer(c.id, e.target.value)}
                        className="bg-slate-600 rounded px-2 py-1"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              {customers.filter((c) => (c.lead_stage || "new") === stage.id).length === 0 && (
                <p className="text-slate-500 text-center py-4">لا يوجد عملاء</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
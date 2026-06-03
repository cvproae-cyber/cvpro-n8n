"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setCustomers(data || []);
    setLoading(false);
  }

  async function updateLeadStage(customerId: string, newStage: string) {
    const { error } = await supabase
      .from("customers")
      .update({ lead_stage: newStage })
      .eq("id", customerId);
    if (error) console.error(error);
    else fetchCustomers();
  }

  const filtered = customers.filter((c) => {
    const matchesSearch = (c.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                          (c.phone_number || "").includes(search) ||
                          (c.instagram_id || "").toLowerCase().includes(search.toLowerCase());
    const matchesStage = filterStage === "all" || c.lead_stage === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">العملاء</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="بحث بالاسم، الهاتف، أو انستاجرام..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-4 py-2 w-64"
        />
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-4 py-2"
        >
          <option value="all">جميع المراحل</option>
          <option value="new">جديد</option>
          <option value="qualified">مؤهل</option>
          <option value="analysis_done">تم تحليل السيرة</option>
          <option value="offer_sent">تم إرسال العرض</option>
          <option value="negotiation">تفاوض</option>
          <option value="won">تم التحويل</option>
          <option value="lost">فقد</option>
        </select>
        <button onClick={fetchCustomers} className="bg-blue-600 px-4 py-2 rounded">تحديث</button>
      </div>

      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-3">الاسم</th>
                <th className="p-3">الهاتف / انستاجرام</th>
                <th className="p-3">المرحلة</th>
                <th className="p-3">درجة الاهتمام</th>
                <th className="p-3">آخر تفاعل</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-800">
                  <td className="p-3 font-medium">{c.full_name || "—"}</td>
                  <td className="p-3">{c.phone_number || c.instagram_id || "—"}</td>
                  <td className="p-3">
                    <select
                      value={c.lead_stage || "new"}
                      onChange={(e) => updateLeadStage(c.id, e.target.value)}
                      className="bg-slate-700 rounded px-2 py-1 text-sm"
                    >
                      <option value="new">جديد</option>
                      <option value="qualified">مؤهل</option>
                      <option value="analysis_done">تم تحليل السيرة</option>
                      <option value="offer_sent">تم إرسال العرض</option>
                      <option value="negotiation">تفاوض</option>
                      <option value="won">تم التحويل</option>
                      <option value="lost">فقد</option>
                    </select>
                  </td>
                  <td className="p-3">{c.buying_intent_score || 0}</td>
                  <td className="p-3">{c.last_interaction ? new Date(c.last_interaction).toLocaleString() : "—"}</td>
                  <td className="p-3">
                    <button className="text-blue-400 hover:underline">عرض المحادثة</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
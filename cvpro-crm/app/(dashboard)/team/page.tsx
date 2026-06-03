"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Agent {
  email: string;
  full_name: string;
  role: "admin" | "agent" | "viewer";
}

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAgent, setNewAgent] = useState({ email: "", full_name: "", role: "agent" as const });

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    const { data, error } = await supabase.from("agents").select("*").order("created_at", { ascending: false });
    if (error) console.error(error);
    else setAgents(data || []);
    setLoading(false);
  }

  async function addAgent() {
    if (!newAgent.email) return;
    const { error } = await supabase.from("agents").insert([newAgent]);
    if (error) console.error(error);
    else {
      setNewAgent({ email: "", full_name: "", role: "agent" });
      fetchAgents();
    }
  }

  async function deleteAgent(email: string) {
    const { error } = await supabase.from("agents").delete().eq("email", email);
    if (error) console.error(error);
    else fetchAgents();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">فريق العمل</h1>
      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">إضافة عضو جديد</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded flex-1 min-w-[200px]"
          />
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={newAgent.full_name}
            onChange={(e) => setNewAgent({ ...newAgent, full_name: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded flex-1 min-w-[200px]"
          />
          <select
            value={newAgent.role}
            onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value as any })}
            className="bg-slate-700 px-3 py-2 rounded"
          >
            <option value="admin">مدير</option>
            <option value="agent">مندوب</option>
            <option value="viewer">مشاهد</option>
          </select>
          <button onClick={addAgent} className="bg-blue-600 px-4 py-2 rounded">إضافة</button>
        </div>
      </div>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3">البريد الإلكتروني</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الدور</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.email} className="border-b border-slate-800">
                <td className="p-3">{a.email}</td>
                <td className="p-3">{a.full_name || "—"}</td>
                <td className="p-3">{a.role}</td>
                <td className="p-3">
                  <button onClick={() => deleteAgent(a.email)} className="text-red-400 hover:underline">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import React from "react";

export default function CustomerSidebar({ customer, onSelect }: { customer: any; onSelect?: () => void }) {
  return (
    <div className="p-3 border-b border-slate-800 hover:bg-slate-800 cursor-pointer" onClick={onSelect}>
      <div className="font-bold">{customer?.full_name}</div>
      <div className="text-xs text-slate-400">{customer?.lead_stage} • score {customer?.lead_score}</div>
    </div>
  );
}

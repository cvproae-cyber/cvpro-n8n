import React from "react";

export default function LeadPipeline() {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-3">Lead Pipeline</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 p-3 rounded">New</div>
        <div className="bg-slate-800 p-3 rounded">Contacted</div>
        <div className="bg-slate-800 p-3 rounded">Converted</div>
      </div>
    </div>
  );
}

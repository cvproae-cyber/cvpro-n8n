import React from "react";

export default function BroadcastModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const handleCreate = async () => {
    // placeholder: call supabase or API route to create broadcast
    onSuccess && onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-lg w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">New Broadcast</h2>
        <input className="w-full p-2 mb-3 rounded bg-slate-800" placeholder="Name" />
        <textarea className="w-full p-2 mb-3 rounded bg-slate-800" rows={4} placeholder="Message" />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1 bg-slate-700 rounded">Cancel</button>
          <button onClick={handleCreate} className="px-3 py-1 bg-blue-600 rounded">Create</button>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function ChatWindow({ messages }: { messages: { id: string; content: string; direction: string }[] }) {
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
          <div className={`p-3 rounded-2xl max-w-md ${m.direction === "outbound" ? "bg-blue-600" : "bg-slate-800"}`}>
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}

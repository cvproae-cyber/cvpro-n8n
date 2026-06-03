import React from "react";

export default function CVUploader({ onUpload }: { onUpload: (file: File) => void }) {
  return (
    <div className="bg-slate-800 p-4 rounded">
      <label className="cursor-pointer inline-block bg-slate-700 px-3 py-2 rounded">
        Upload CV
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </label>
    </div>
  );
}

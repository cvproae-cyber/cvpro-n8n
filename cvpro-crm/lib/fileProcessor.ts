/**
 * Very small helper to extract text from a public storage path or File
 * - If given a File, we read it locally
 * - If given a string, assume it's a Supabase storage path and fetch via public URL
 */
export async function extractTextFromFile(input: File | string) {
  if (typeof input === "string") {
    // assume public path in Supabase storage; caller should provide a full URL or storage path
    try {
      const res = await fetch(input, { method: 'GET' });
      if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
      
      const blob = await res.blob();
      // Basic check: if it's a PDF or Word, standard .text() will return garbage.
      // Real implementation would need a library like pdf-parse.
      if (blob.type.includes('pdf') || blob.type.includes('word')) return "[Binary File - Text Extraction Requires OCR/Parser]";
      const text = await (new Response(blob).text());
      return text.slice(0, 20000); // limit
    } catch (e) {
      console.warn("Could not fetch file at", input, e);
      return "";
    }
  }

  // File path: try to extract text for common types (pdf/docx not implemented here)
  try {
    if (input.type.includes('pdf') || input.type.includes('word')) return "[Binary File - Text Extraction Requires OCR/Parser]";
    const text = await input.text();
    return text.slice(0, 20000);
  } catch (e) {
    return "";
  }
}

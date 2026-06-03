import { extractTextFromFile } from "./fileProcessor";

export async function analyzeCV(file: File | string) {
  const text = typeof file === "string" ? await extractTextFromFile(file) : await extractTextFromFile(file);
  const prompt = `
You are an expert ATS and HR professional for the UAE/Gulf market.
Analyze this CV and return JSON with the following structure:
{
  "score": 0-100,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "ats_compatibility": "good" | "fair" | "poor",
  "formatting_issues": ["string"],
  "keyword_gaps": ["string"],
  "linkedin_suggestions": ["string"],
  "sales_pitch": "Convince this candidate to buy CV Writing service (max 100 words)",
  "personalized_offer": "20% discount code"
}
CV Text: """${text}"""
  `;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    const resultText = json?.text || "";
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Failed to analyze CV via server API", e);
    return { score: 0, strengths: [], weaknesses: [], sales_pitch: "", personalized_offer: null };
  }
}

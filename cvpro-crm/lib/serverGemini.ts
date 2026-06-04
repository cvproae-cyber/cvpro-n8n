import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = process.env.GEMINI_API_KEYS?.split(",") || [];
let currentIdx = 0;
const MODEL_NAME = "gemini-1.5-flash"; 

async function callWithKey(key: string, prompt: string, temperature = 0.7) {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature },
  });
  const response = await result.response;
  const text = typeof response.text === 'function' ? response.text() : "";
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

/**
 * Server-side wrapper for Gemini with key rotation and retry logic.
 * This ensures that sensitive API keys never reach the client.
 */
export async function serverCallGemini(prompt: string, temperature = 0.7, maxRetries = 3) {
  if (!API_KEYS.length) {
    throw new Error("No GEMINI_API_KEYS configured on server. Please check your environment variables.");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const totalKeys = API_KEYS.length;
    for (let i = 0; i < totalKeys; i++) {
      const idx = (currentIdx + i) % totalKeys;
      const key = API_KEYS[idx];
      try {
        const text = await callWithKey(key, prompt, temperature);
        // On success, update currentIdx to start from the NEXT key for the next request
        currentIdx = (idx + 1) % totalKeys;
        return text;
      } catch (err: any) {
        const isRateLimit = err?.message?.includes('429') || err?.status === 429;
        if (isRateLimit) {
          console.warn(`Gemini Key at index ${idx} rate limited. Trying next key...`);
        } else {
          console.warn(`Server Gemini key failed (Index ${idx}):`, err.message || err);
        }
        // Continue to the next key in the pool
      }
    }
    
    // If all keys in the pool failed, wait before the next attempt
    if (attempt < maxRetries) {
      const delay = 1000 * attempt;
      console.log(`Gemini pool exhausted. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  
  throw new Error("All server Gemini keys failed after multiple retries.");
}

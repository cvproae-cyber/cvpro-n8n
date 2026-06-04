import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Server-side wrapper for Gemini using Vercel AI SDK.
 * Expects GOOGLE_GENERATIVE_AI_API_KEY in environment variables.
 */
export async function serverCallGemini(prompt: string, temperature = 0.7) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
      temperature: temperature,
    });

    if (!text) throw new Error("Empty response from AI Provider");
    return text;
  } catch (error: any) {
    console.error("Vercel AI SDK Error:", error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

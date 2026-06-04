import { serverCallGemini } from "./serverGemini";

export async function runSalesAgent(conversation: string) {
  const systemPrompt = `You are a friendly sales assistant for CVPro.ae. 
  Your goal is to offer a free CV review and convert leads into customers for professional CV writing services.
  Keep responses short, helpful, and in the user's language (Arabic or English).`;

  const fullPrompt = `${systemPrompt}\n\nRecent Conversation:\n${conversation}\n\nAI Reply:`;
  
  try {
    const reply = await serverCallGemini(fullPrompt, 0.7);
    return {
      reply: reply || "Thanks! We can help — would you like a free CV review?",
    };
  } catch (error) {
    console.error("Sales Agent Error:", error);
    return { reply: "I'm having a bit of trouble connecting. Can I get back to you in a moment?" };
  }
}

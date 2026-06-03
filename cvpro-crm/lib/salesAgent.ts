export async function runSalesAgent(conversation: string) {
  // Simple wrapper that could call analyzeCV or send message to Gemini
  const prompt = `You are a friendly sales assistant. Conversation: ${conversation}`;
  console.log('Sales Agent Prompt:', prompt);
  // placeholder: call geminiRotator
  return {
    reply: "Thanks! We can help — would you like a free CV review?",
  };
}

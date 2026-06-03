// =============================================================
// Usage Examples — n8n Code Nodes
// Copy-paste snippets for CVPro.ae workflows
// =============================================================

// ── 1. Gemini Text Generation ─────────────────────────────────
const { GeminiRotator } = require('/home/node/scripts/gemini-rotation.js');
const rotator = new GeminiRotator(process.env.GEMINI_API_KEYS.split(','));

const reply = await rotator.call(
  userMessage,            // prompt
  systemPrompt,           // system instruction
  300,                    // max tokens
  0.7                     // temperature
);
return [{ json: { reply } }];


// ── 2. Gemini JSON Output (CV Analysis) ───────────────────────
const { GeminiRotator } = require('/home/node/scripts/gemini-rotation.js');
const rotator = new GeminiRotator(process.env.GEMINI_API_KEYS.split(','));

const analysis = await rotator.callJSON(
  cvText.substring(0, 6000),
  `You are an ATS CV expert. Return ONLY valid JSON with keys:
   ats_score, formatting_score, keyword_score, readability_score,
   achievements_score, grammar_score, linkedin_compatibility_score,
   uae_gulf_score, weaknesses (array), improvements (array),
   sales_pitch (Arabic string), personalized_offer (object).`
);
return [{ json: { analysis } }];


// ── 3. Gemini Embeddings (for pgvector memory) ────────────────
const { GeminiRotator } = require('/home/node/scripts/gemini-rotation.js');
const rotator = new GeminiRotator(process.env.GEMINI_API_KEYS.split(','));

const embedding = await rotator.embed(messageText);
// embedding is a float[] with 768 dimensions — store in Supabase vector_memory
return [{ json: { embedding } }];


// ── 4. Redis Session (Upstash) ────────────────────────────────
const { UpstashRedis } = require('/home/node/scripts/upstash-redis-adapter.js');
const redis = new UpstashRedis();

// Get or create session
let session = await redis.getSession(customerId);
if (!session) session = { messages: [], leadStage: 'new', intentScore: 0 };

// Add new message to session
session.messages.push({ role: 'user', content: userMessage });
if (session.messages.length > 20) session.messages = session.messages.slice(-20);

// Save back with 2-hour TTL
await redis.setSession(customerId, session, 7200);
return [{ json: { session } }];


// ── 5. Rate Limiting (Upstash) ────────────────────────────────
const { UpstashRedis } = require('/home/node/scripts/upstash-redis-adapter.js');
const redis = new UpstashRedis();

// 20 requests per minute per user
const { allowed, count } = await redis.checkRateLimit(
  `ratelimit:${from}`,  // key
  20,                    // max requests
  60                     // window in seconds
);
if (!allowed) {
  return [{ json: { reply: 'يرجى الانتظار قليلاً ثم حاول مجدداً. 🙏', rateLimited: true } }];
}

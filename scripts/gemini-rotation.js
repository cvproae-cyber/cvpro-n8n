// =============================================================
// gemini-rotation.js — CVPro.ae
// Gemini API key rotation with Upstash Redis rate limiting
// Drop into: /home/node/scripts/gemini-rotation.js (via Dockerfile)
// =============================================================

const GEMINI_GENERATE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_EMBED    = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';
const RATE_LIMIT_RPM  = 55; // stay under the 60 RPM free-tier ceiling

// ── Upstash helper (HTTP REST — no TCP Redis needed) ──────────
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCmd(...args) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Fallback: in-memory tracking when Upstash is not configured
    return null;
  }
  const res = await fetch(UPSTASH_URL, {
    method:  'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(args),
  });
  const json = await res.json();
  return json.result;
}

// ── In-memory fallback (single-instance) ──────────────────────
const memUsage = new Map(); // key → { count, resetAt }

async function isKeyThrottled(apiKey) {
  const shortKey = apiKey.slice(-8); // use last 8 chars as Redis key suffix
  const redisKey = `cvpro:gemini:${shortKey}`;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const count = await redisCmd('GET', redisKey);
    return parseInt(count || '0', 10) >= RATE_LIMIT_RPM;
  }

  // In-memory fallback
  const now  = Date.now();
  const slot = memUsage.get(apiKey);
  if (!slot || now > slot.resetAt) {
    memUsage.set(apiKey, { count: 0, resetAt: now + 60_000 });
    return false;
  }
  return slot.count >= RATE_LIMIT_RPM;
}

async function recordKeyUsage(apiKey) {
  const shortKey = apiKey.slice(-8);
  const redisKey = `cvpro:gemini:${shortKey}`;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const count = await redisCmd('INCR', redisKey);
    if (count === 1) await redisCmd('EXPIRE', redisKey, 60); // expire after 1 minute
    return;
  }

  // In-memory fallback
  const slot = memUsage.get(apiKey) || { count: 0, resetAt: Date.now() + 60_000 };
  slot.count++;
  memUsage.set(apiKey, slot);
}

// ── Main Rotator ───────────────────────────────────────────────
class GeminiRotator {
  constructor(keys) {
    this.keys = keys.map(k => k.trim()).filter(Boolean);
    if (!this.keys.length) throw new Error('No GEMINI_API_KEYS provided');
  }

  /** Shuffle keys randomly to distribute load evenly */
  _shuffled() {
    return [...this.keys].sort(() => Math.random() - 0.5);
  }

  /**
   * Generate text using Gemini 2.5 Flash.
   * @param {string} prompt
   * @param {string} systemInstruction  - Optional system prompt
   * @param {number} maxTokens
   * @param {number} temperature
   * @returns {Promise<string>}
   */
  async call(prompt, systemInstruction = '', maxTokens = 500, temperature = 0.7) {
    const keys = this._shuffled();
    let lastError;

    for (const key of keys) {
      if (await isKeyThrottled(key)) continue;

      try {
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        };
        if (systemInstruction) {
          body.system_instruction = { parts: [{ text: systemInstruction }] };
        }

        const res = await fetch(`${GEMINI_GENERATE}?key=${key}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });

        if (res.status === 429) {
          // Force-mark as throttled
          await redisCmd('SET', `cvpro:gemini:${key.slice(-8)}`, RATE_LIMIT_RPM, 'EX', 60);
          continue;
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Gemini ${res.status}: ${txt}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          await recordKeyUsage(key);
          return text;
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(`All Gemini keys exhausted. Last: ${lastError?.message}`);
  }

  /**
   * Generate embeddings (768-dim, text-embedding-004).
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embed(text) {
    const keys = this._shuffled();
    let lastError;

    for (const key of keys) {
      if (await isKeyThrottled(key)) continue;
      try {
        const res = await fetch(`${GEMINI_EMBED}?key=${key}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model:   'models/text-embedding-004',
            content: { parts: [{ text }] },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          await recordKeyUsage(key);
          return data.embedding.values;
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(`Embedding failed. Last: ${lastError?.message}`);
  }

  /**
   * Generate JSON-structured output (sets responseMimeType).
   * @param {string} prompt
   * @param {string} systemInstruction
   * @returns {Promise<object>}
   */
  async callJSON(prompt, systemInstruction = '') {
    const keys = this._shuffled();
    let lastError;

    for (const key of keys) {
      if (await isKeyThrottled(key)) continue;
      try {
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        };
        if (systemInstruction) {
          body.system_instruction = { parts: [{ text: systemInstruction }] };
        }

        const res = await fetch(`${GEMINI_GENERATE}?key=${key}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });

        if (res.status === 429) continue;
        if (!res.ok) throw new Error(`Gemini ${res.status}`);

        const data = await res.json();
        const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          await recordKeyUsage(key);
          return JSON.parse(raw.replace(/```json|```/g, '').trim());
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(`Gemini JSON call failed. Last: ${lastError?.message}`);
  }
}

// ── Export ─────────────────────────────────────────────────────
module.exports = { GeminiRotator };

// ── Quick self-test (run: node gemini-rotation.js) ─────────────
if (require.main === module) {
  const keys = (process.env.GEMINI_API_KEYS || '').split(',');
  const r = new GeminiRotator(keys);
  r.call('Say hello in Arabic in one sentence.')
    .then(t => console.log('✅ Test reply:', t))
    .catch(e => console.error('❌ Test failed:', e.message));
}

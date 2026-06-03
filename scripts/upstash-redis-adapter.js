// =============================================================
// upstash-redis-adapter.js — CVPro.ae
// Wraps Upstash REST API to look like a basic Redis client.
// Use inside n8n Code nodes instead of ioredis (no TCP needed).
// =============================================================

class UpstashRedis {
  constructor() {
    this.url   = process.env.UPSTASH_REDIS_REST_URL;
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!this.url || !this.token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
    }
  }

  async _cmd(...args) {
    const res = await fetch(this.url, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    return json.result;
  }

  // ── String ops ────────────────────────────────────────────────
  get(key)                    { return this._cmd('GET', key); }
  set(key, value)             { return this._cmd('SET', key, value); }
  setex(key, secs, value)     { return this._cmd('SETEX', key, String(secs), value); }
  del(key)                    { return this._cmd('DEL', key); }
  incr(key)                   { return this._cmd('INCR', key); }
  expire(key, secs)           { return this._cmd('EXPIRE', key, String(secs)); }
  ttl(key)                    { return this._cmd('TTL', key); }
  keys(pattern)               { return this._cmd('KEYS', pattern); }

  // ── Hash ops ──────────────────────────────────────────────────
  hget(key, field)            { return this._cmd('HGET', key, field); }
  hset(key, field, value)     { return this._cmd('HSET', key, field, value); }
  hdel(key, field)            { return this._cmd('HDEL', key, field); }
  async hgetall(key) {
    const flat = await this._cmd('HGETALL', key);
    if (!flat || !flat.length) return null;
    const obj = {};
    for (let i = 0; i < flat.length; i += 2) obj[flat[i]] = flat[i + 1];
    return obj;
  }

  // ── List ops ──────────────────────────────────────────────────
  lpush(key, ...vals)         { return this._cmd('LPUSH', key, ...vals); }
  rpush(key, ...vals)         { return this._cmd('RPUSH', key, ...vals); }
  lrange(key, start, stop)    { return this._cmd('LRANGE', key, start, stop); }
  llen(key)                   { return this._cmd('LLEN', key); }

  // ── Session helpers ───────────────────────────────────────────
  async getSession(customerId) {
    const raw = await this.get(`session:${customerId}`);
    return raw ? JSON.parse(raw) : null;
  }
  async setSession(customerId, data, ttlSeconds = 3600) {
    return this.setex(`session:${customerId}`, ttlSeconds, JSON.stringify(data));
  }
  async delSession(customerId) {
    return this.del(`session:${customerId}`);
  }

  // ── Rate-limit helper ─────────────────────────────────────────
  async checkRateLimit(key, maxRequests, windowSeconds) {
    const count = await this.incr(key);
    if (count === 1) await this.expire(key, windowSeconds);
    return { allowed: count <= maxRequests, count, max: maxRequests };
  }
}

module.exports = { UpstashRedis };

// ── Usage example inside n8n Code node ────────────────────────
// const { UpstashRedis } = require('/home/node/scripts/upstash-redis-adapter.js');
// const redis = new UpstashRedis();
// const session = await redis.getSession(customerId);
// await redis.setSession(customerId, { ...session, lastMessage: text });

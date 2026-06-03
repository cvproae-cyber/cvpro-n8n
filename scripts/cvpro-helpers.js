// =============================================================
// cvpro-helpers.js — CVPro.ae shared Supabase + conversation helpers
// Use inside n8n Code nodes via require('/home/node/scripts/cvpro-helpers.js')
// =============================================================

function sbConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  return { url, key };
}

function sbHeaders(extra = {}) {
  const { key } = sbConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra,
  };
}

async function sbRequest($http, method, path, body, extraHeaders = {}) {
  const { url } = sbConfig();
  const opts = { method, url: `${url}${path}`, headers: { ...sbHeaders(), ...extraHeaders } };
  if (body !== undefined) opts.body = body;
  return $http.request(opts);
}

async function getOrCreateCustomer($http, { phone_number, instagram_id, full_name, preferred_language }) {
  const filter = phone_number
    ? `phone_number=eq.${encodeURIComponent(phone_number)}`
    : `instagram_id=eq.${encodeURIComponent(instagram_id)}`;
  const existing = await sbRequest($http, 'GET', `/rest/v1/customers?${filter}&select=*&limit=1`);
  if (existing?.length) return existing[0];

  const body = { lead_stage: 'new' };
  if (phone_number) body.phone_number = phone_number;
  if (instagram_id) body.instagram_id = instagram_id;
  if (full_name) body.full_name = full_name;
  if (preferred_language) body.preferred_language = preferred_language;

  const created = await sbRequest($http, 'POST', '/rest/v1/customers', body);
  return Array.isArray(created) ? created[0] : created;
}

async function getOrCreateConversation($http, customerId, channel) {
  const open = await sbRequest(
    $http,
    'GET',
    `/rest/v1/conversations?customer_id=eq.${customerId}&channel=eq.${channel}&status=eq.open&select=*&limit=1`
  );
  if (open?.length) return open[0];

  const created = await sbRequest($http, 'POST', '/rest/v1/conversations', {
    customer_id: customerId,
    channel,
    status: 'open',
  });
  return Array.isArray(created) ? created[0] : created;
}

async function saveMessage($http, conversationId, direction, content, extra = {}) {
  const body = {
    conversation_id: conversationId,
    direction,
    content: content || '',
    content_type: extra.content_type || 'text',
    is_ai_generated: extra.is_ai_generated ?? direction === 'outbound',
    ...extra,
  };
  const saved = await sbRequest($http, 'POST', '/rest/v1/messages', body);
  return Array.isArray(saved) ? saved[0] : saved;
}

async function getMessageHistory($http, conversationId, limit = 10) {
  const rows = await sbRequest(
    $http,
    'GET',
    `/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.desc&limit=${limit}&select=direction,content,created_at`
  );
  return (rows || []).reverse();
}

function formatHistory(messages, inboundLabel = 'عميل', outboundLabel = 'بوت') {
  return messages
    .map((m) => `${m.direction === 'inbound' ? inboundLabel : outboundLabel}: ${m.content}`)
    .join('\n');
}

function normalizeCvAnalysis(raw) {
  if (!raw) return null;
  return {
    ats_score: raw.ats_score ?? 0,
    formatting_score: raw.formatting_score ?? 0,
    keyword_score: raw.keyword_score ?? 0,
    readability_score: raw.readability_score ?? 0,
    achievements_score: raw.achievements_score ?? 0,
    grammar_score: raw.grammar_score ?? 0,
    linkedin_compatibility_score:
      raw.linkedin_compatibility_score ?? raw.linkedin_compatibility ?? 0,
    uae_gulf_score: raw.uae_gulf_score ?? raw.uae_gulf_fit ?? 0,
    weaknesses: raw.weaknesses || [],
    improvement_suggestions: raw.improvement_suggestions || raw.improvements || [],
    sales_pitch: raw.sales_pitch || '',
    personalized_offer: raw.personalized_offer || {},
  };
}

async function saveCvAnalysis($http, customerId, text, analysis, filename = 'uploaded_cv') {
  const normalized = normalizeCvAnalysis(analysis);
  const saved = await sbRequest($http, 'POST', '/rest/v1/cv_analyses', {
    customer_id: customerId,
    original_filename: filename,
    extracted_text: (text || '').substring(0, 2000),
    ...normalized,
  });
  return Array.isArray(saved) ? saved[0] : saved;
}

async function updateCustomer($http, customerId, fields) {
  return sbRequest($http, 'PATCH', `/rest/v1/customers?id=eq.${customerId}`, fields);
}

async function setHumanTakeover($http, conversationId, agentEmail) {
  return sbRequest($http, 'PATCH', `/rest/v1/conversations?id=eq.${conversationId}`, {
    human_takeover: true,
    assigned_agent_id: agentEmail || null,
    status: 'pending_human',
  });
}

function verifyMetaWebhook(query, expectedToken) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];
  if (mode === 'subscribe' && token === expectedToken) {
    return { verified: true, challenge: String(challenge) };
  }
  return { verified: false, challenge: null };
}

module.exports = {
  sbConfig,
  sbHeaders,
  sbRequest,
  getOrCreateCustomer,
  getOrCreateConversation,
  saveMessage,
  getMessageHistory,
  formatHistory,
  normalizeCvAnalysis,
  saveCvAnalysis,
  updateCustomer,
  setHumanTakeover,
  verifyMetaWebhook,
};

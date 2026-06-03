-- ============================================================
-- CVPro.ae — Complete Supabase Schema
-- Run once in Supabase SQL Editor or via apply_migration
-- ============================================================

-- n8n internal schema (Railway uses DB_POSTGRESDB_SCHEMA=n8n)
CREATE SCHEMA IF NOT EXISTS n8n;

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── CUSTOMERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number         TEXT UNIQUE,
  instagram_id         TEXT UNIQUE,
  email                TEXT,
  full_name            TEXT,
  preferred_language   TEXT DEFAULT 'ar',
  lead_stage           TEXT DEFAULT 'new'
    CHECK (lead_stage IN ('new','qualified','analysis_done','offer_sent','negotiation','won','lost')),
  buying_intent_score  INT DEFAULT 0 CHECK (buying_intent_score BETWEEN 0 AND 100),
  budget_estimate      INT,
  last_interaction     TIMESTAMPTZ,
  tags                 TEXT[] DEFAULT '{}',
  assigned_agent       TEXT,
  notes                TEXT,
  meta                 JSONB DEFAULT '{}',
  consent_given        BOOLEAN DEFAULT false,
  consent_date         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ── CONVERSATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id              UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  channel                  TEXT NOT NULL CHECK (channel IN ('whatsapp','instagram')),
  channel_conversation_id  TEXT,
  status                   TEXT DEFAULT 'open'
    CHECK (status IN ('open','closed','pending_human')),
  human_takeover           BOOLEAN DEFAULT false,
  assigned_agent_id        TEXT,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction        TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  content          TEXT,
  content_type     TEXT DEFAULT 'text'
    CHECK (content_type IN ('text','image','audio','document','voice_note','sticker')),
  media_url        TEXT,
  media_mime       TEXT,
  is_ai_generated  BOOLEAN DEFAULT true,
  ai_model         TEXT,
  tokens_used      INT,
  sentiment        TEXT CHECK (sentiment IN ('positive','neutral','negative')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── VECTOR MEMORY (pgvector) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS vector_memory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  embedding    vector(768),
  text_chunk   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- HNSW index (works on empty table; ivfflat needs rows first)
CREATE INDEX IF NOT EXISTS idx_vector_embedding_hnsw
  ON vector_memory USING hnsw (embedding vector_cosine_ops);

-- ── CV ANALYSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_analyses (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  original_filename             TEXT,
  extracted_text                TEXT,
  ats_score                     INT CHECK (ats_score BETWEEN 0 AND 100),
  formatting_score              INT CHECK (formatting_score BETWEEN 0 AND 100),
  keyword_score                 INT CHECK (keyword_score BETWEEN 0 AND 100),
  readability_score             INT CHECK (readability_score BETWEEN 0 AND 100),
  achievements_score            INT CHECK (achievements_score BETWEEN 0 AND 100),
  grammar_score                 INT CHECK (grammar_score BETWEEN 0 AND 100),
  linkedin_compatibility_score  INT CHECK (linkedin_compatibility_score BETWEEN 0 AND 100),
  uae_gulf_score                INT CHECK (uae_gulf_score BETWEEN 0 AND 100),
  overall_score                 INT GENERATED ALWAYS AS (
    (COALESCE(ats_score,0) + COALESCE(formatting_score,0) + COALESCE(keyword_score,0) +
     COALESCE(readability_score,0) + COALESCE(achievements_score,0) + COALESCE(grammar_score,0) +
     COALESCE(linkedin_compatibility_score,0) + COALESCE(uae_gulf_score,0)) / 8
  ) STORED,
  weaknesses                    TEXT[],
  improvement_suggestions       TEXT[],
  sales_pitch                   TEXT,
  personalized_offer            JSONB,
  created_at                    TIMESTAMPTZ DEFAULT now()
);

-- ── BROADCASTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS broadcasts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  channel          TEXT CHECK (channel IN ('whatsapp','instagram','both')),
  template_name    TEXT,
  audience_filter  JSONB,
  status           TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','scheduled','sending','completed','failed')),
  scheduled_at     TIMESTAMPTZ,
  sent_count       INT DEFAULT 0,
  delivered_count  INT DEFAULT 0,
  failed_count     INT DEFAULT 0,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── TEMPLATES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  category   TEXT CHECK (category IN ('welcome','followup','offer','human_handoff','closing','referral')),
  content    TEXT NOT NULL,
  language   TEXT DEFAULT 'ar',
  variables  JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── DAILY ANALYTICS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_analytics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                      DATE UNIQUE NOT NULL,
  total_conversations       INT DEFAULT 0,
  ai_resolved               INT DEFAULT 0,
  human_takeover            INT DEFAULT 0,
  leads_qualified           INT DEFAULT 0,
  cvs_analyzed              INT DEFAULT 0,
  offers_sent               INT DEFAULT 0,
  sales_won                 INT DEFAULT 0,
  revenue_aed               DECIMAL(10,2) DEFAULT 0,
  avg_response_time_seconds INT DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT now()
);

-- ── AGENTS (simple RBAC) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  email      TEXT PRIMARY KEY,
  full_name  TEXT,
  role       TEXT CHECK (role IN ('admin','agent','viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── PERFORMANCE INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_lead_stage   ON customers(lead_stage);
CREATE INDEX IF NOT EXISTS idx_customers_intent       ON customers(buying_intent_score);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status   ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation  ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created       ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_customer   ON cv_analyses(customer_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled   ON broadcasts(scheduled_at)
  WHERE status = 'scheduled';

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customers_updated ON customers;
CREATE TRIGGER trg_customers_updated
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analyses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_memory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents           ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if re-running
DROP POLICY IF EXISTS service_all_customers ON customers;
DROP POLICY IF EXISTS service_all_conversations ON conversations;
DROP POLICY IF EXISTS service_all_messages ON messages;
DROP POLICY IF EXISTS service_all_cv_analyses ON cv_analyses;

-- Appsmith dashboard reads via anon key (read-only)
DROP POLICY IF EXISTS anon_read_customers ON customers;
CREATE POLICY anon_read_customers ON customers FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_conversations ON conversations;
CREATE POLICY anon_read_conversations ON conversations FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_messages ON messages;
CREATE POLICY anon_read_messages ON messages FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_cv_analyses ON cv_analyses;
CREATE POLICY anon_read_cv_analyses ON cv_analyses FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_daily_analytics ON daily_analytics;
CREATE POLICY anon_read_daily_analytics ON daily_analytics FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_templates ON templates;
CREATE POLICY anon_read_templates ON templates FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_broadcasts ON broadcasts;
CREATE POLICY anon_read_broadcasts ON broadcasts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_read_agents ON agents;
CREATE POLICY anon_read_agents ON agents FOR SELECT TO anon USING (true);

-- ── REALTIME (Appsmith live updates) ──────────────────────────
ALTER TABLE customers     REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages      REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE customers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── STORAGE (CV files — free tier 1GB) ────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-files',
  'cv-files',
  false,
  10485760,
  ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ── SIMILARITY SEARCH FUNCTION ────────────────────────────────
CREATE OR REPLACE FUNCTION search_memory(
  query_embedding vector(768),
  customer_uuid   UUID,
  match_count     INT DEFAULT 5
)
RETURNS TABLE(text_chunk TEXT, similarity FLOAT)
LANGUAGE SQL STABLE AS $$
  SELECT text_chunk,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   vector_memory
  WHERE  customer_id = customer_uuid
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

-- ── VIEW: messages with customer (for Appsmith inbox) ─────────
CREATE OR REPLACE VIEW inbox_messages AS
SELECT
  m.id,
  m.conversation_id,
  conv.customer_id,
  conv.channel,
  m.direction,
  m.content,
  m.content_type,
  m.is_ai_generated,
  m.created_at,
  cust.full_name,
  cust.phone_number,
  cust.instagram_id,
  cust.lead_stage,
  conv.human_takeover
FROM messages m
JOIN conversations conv ON conv.id = m.conversation_id
JOIN customers cust ON cust.id = conv.customer_id;

-- ── SEED DATA ─────────────────────────────────────────────────
INSERT INTO templates (name, category, content, language) VALUES
(
  'welcome_ar',
  'welcome',
  'مرحباً! أنا المساعد الذكي لـ CVPro.ae 🎯 نحن متخصصون في كتابة السير الذاتية الاحترافية للسوق الإماراتي والخليجي. هل تريد تقييمًا مجانيًا لسيرتك الذاتية الآن؟',
  'ar'
),
(
  'welcome_en',
  'welcome',
  'Hello! I''m the AI assistant for CVPro.ae 🎯 We specialize in professional CVs for the UAE & Gulf market. Would you like a FREE CV assessment?',
  'en'
),
(
  'followup_offer',
  'followup',
  'مرحباً {{full_name}}! 👋 لا تزال فرصة الحصول على سيرتك الذاتية الاحترافية متاحة. لدينا خصم 15% هذا الأسبوع فقط. تواصل معنا الآن!',
  'ar'
),
(
  'human_handoff',
  'human_handoff',
  'شكراً لتواصلك! سيتواصل معك أحد خبرائنا خلال دقائق. 😊',
  'ar'
)
ON CONFLICT (name) DO NOTHING;

INSERT INTO agents (email, full_name, role) VALUES
  ('admin@cvpro.ae', 'CVPro Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

SELECT 'CVPro schema installed successfully ✅' AS status;

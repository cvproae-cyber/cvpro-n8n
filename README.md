# CVPro.ae — AI-Powered CV Sales Automation
> WhatsApp + Instagram AI Agent · n8n · Supabase · Upstash Redis · Appsmith
> **100% Free-tier stack — zero monthly cost**

---

## What This Does

| Feature | How |
|---|---|
| WhatsApp AI Sales Agent | Gemini 2.5 Flash responds to customers 24/7 |
| CV Analysis | ATS scoring, weaknesses, personalized offer |
| Instagram DMs + Comments | Same AI logic, separate channel |
| Lead Pipeline | Scores intent 0–100, moves stages automatically |
| Follow-ups | Cron job re-engages stale leads with discount |
| Broadcasts | Send bulk WhatsApp/Instagram messages |
| Human Takeover | Agent takes over flagged conversations |
| Analytics | Daily aggregation of KPIs & revenue |
| Dashboard | Appsmith CRM with real-time Supabase data |

---

## Architecture (All Free Tier)

```
WhatsApp / Instagram
       ↓
  n8n on Railway  ←→  Supabase (DB + Storage + Auth)
       ↓                    ↑
  Gemini API (6 keys)  Upstash Redis (cache)
       ↓
  Appsmith Cloud (dashboard)
```

---

## 📋 Prerequisites (All Free)

- [x] [Railway account](https://railway.app) — deploy n8n
- [x] [Supabase account](https://supabase.com) — PostgreSQL + pgvector
- [x] [Upstash account](https://upstash.com) — Redis (HTTP-based, no extra service)
- [x] [Appsmith Cloud account](https://app.appsmith.com) — dashboard
- [x] [Google AI Studio](https://aistudio.google.com) — Gemini API keys (up to 6 free)
- [x] [Meta Developer account](https://developers.facebook.com) — WhatsApp + Instagram APIs
- [x] GitHub account — to host this repo for Railway

---

## 🚀 Deployment — Step by Step

> **Arabic quick-start after fixes:** see [SETUP-AR.md](./SETUP-AR.md)  
> **Supabase project connected:** `ityxmafonqiffpmdrpar` (CV PRO CRM)

### STEP 1 — Push to GitHub

```bash
# On your computer (or just upload via GitHub web UI)
git init
git add .
git commit -m "CVPro initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/cvpro-n8n.git
git push -u origin main
```

---

### STEP 2 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `cvpro`, pick a region close to UAE (e.g., `eu-west-1`), set a DB password
3. Wait ~2 minutes for provisioning
4. Go to **SQL Editor** → click **New Query**
5. Open `supabase/schema.sql` from this repo, paste the entire content, click **Run**
6. You should see: `CVPro schema installed successfully ✅`

**Collect these values (you'll need them for Railway):**
- **Project URL**: Settings → API → `https://xxxx.supabase.co`
- **Anon Key**: Settings → API → `anon public`
- **Service Role Key**: Settings → API → `service_role` (keep secret!)
- **DB Host**: Settings → Database → Transaction Pooler → Host (looks like `aws-0-eu-central-1.pooler.supabase.com`)
- **DB Password**: the password you set when creating the project
- **Project Ref**: the part of your URL before `.supabase.co` (e.g., `abcdefgh`)

---

### STEP 3 — Set Up Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Name: `cvpro-redis`, Region: pick closest to UAE
3. After creation, click **REST API** tab
4. Copy:
   - **UPSTASH_REDIS_REST_URL** (looks like `https://eu1-xxxxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long token string)

---

### STEP 4 — Get Gemini API Keys

1. Go to [aistudio.google.com](https://aistudio.google.com) → **Get API Key**
2. Create up to 6 keys (different Google accounts for more quota)
3. Save them comma-separated: `AIzaSy...,AIzaSy...,AIzaSy...`

---

### STEP 5 — Deploy n8n to Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `cvpro-n8n` repository
4. Railway will auto-detect the `railway.toml` and build `Dockerfile.n8n`
5. Wait for the build to complete (~3-5 minutes)
6. Once deployed, copy your public URL (e.g., `https://cvpro-n8n-production.up.railway.app`)

**Set Environment Variables on Railway:**

Go to your service → **Variables** tab → click **Add Variable** for each:

```
N8N_ENCRYPTION_KEY         = [generate: openssl rand -hex 16]
N8N_BASIC_AUTH_ACTIVE      = true
N8N_BASIC_AUTH_USER        = admin
N8N_BASIC_AUTH_PASSWORD    = [your strong password]
WEBHOOK_URL                = https://YOUR-PROJECT.up.railway.app
N8N_HOST                   = YOUR-PROJECT.up.railway.app
N8N_PROTOCOL               = https
N8N_PORT                   = 5678
N8N_LISTEN_ADDRESS         = 0.0.0.0

DB_TYPE                    = postgresdb
DB_POSTGRESDB_HOST         = [from Supabase - Transaction Pooler host]
DB_POSTGRESDB_PORT         = 5432
DB_POSTGRESDB_DATABASE     = postgres
DB_POSTGRESDB_USER         = postgres.[your-project-ref]
DB_POSTGRESDB_PASSWORD     = [your supabase DB password]
DB_POSTGRESDB_SCHEMA       = n8n
DB_POSTGRESDB_SSL_ENABLED  = true

SUPABASE_URL               = https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY  = eyJ...
SUPABASE_ANON_KEY          = eyJ...

UPSTASH_REDIS_REST_URL     = https://[your-db].upstash.io
UPSTASH_REDIS_REST_TOKEN   = [your-token]

GEMINI_API_KEYS            = AIzaSy...,AIzaSy...,AIzaSy...
GENERIC_TIMEZONE           = Asia/Dubai

EXECUTIONS_DATA_PRUNE      = true
EXECUTIONS_DATA_MAX_AGE    = 24
```

> After adding variables, Railway will auto-redeploy. Wait for it.

7. Open your Railway URL → you should see the n8n login screen
8. Log in with `admin` / your password

---

### STEP 6 — Import n8n Workflows

1. In n8n, click **Workflows** in the sidebar → **Import**
2. Import all 11 files from `n8n/workflows/` one by one:
   - `01-whatsapp-webhook.json`
   - `02-instagram-webhook.json`
   - `03-cv-analyzer.json`
   - `04-sales-agent.json`
   - `05-memory-system.json`
   - `06-file-processor.json`
   - `07-follow-up-cron.json`
   - `08-broadcast-sender.json`
   - `09-human-takeover.json`
   - `10-analytics-daily.json`
   - `11-lead-scoring.json`
3. **Activate** each workflow (toggle ON)

---

### STEP 7 — Configure WhatsApp Webhook

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Open your app → **WhatsApp** → **Configuration** → **Webhook**
3. Set:
   - **Callback URL**: `https://YOUR-PROJECT.up.railway.app/webhook/whatsapp`
   - **Verify Token**: `cvpro_verify_2024_random` (must match `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
4. Subscribe to: `messages`
5. Add to Railway variables:
   ```
   WHATSAPP_PHONE_NUMBER_ID      = [from WhatsApp API Setup page]
   WHATSAPP_BUSINESS_ACCOUNT_ID  = [from Business Settings]
   WHATSAPP_ACCESS_TOKEN         = [your permanent token]
   WHATSAPP_WEBHOOK_VERIFY_TOKEN = cvpro_verify_2024_random
   ```

---

### STEP 8 — Configure Instagram Webhook

1. In your Meta app → **Instagram** → **Webhooks**
2. Set:
   - **Callback URL**: `https://YOUR-PROJECT.up.railway.app/webhook/instagram`
   - **Verify Token**: `cvpro_insta_verify_2024`
3. Subscribe to: `messages`, `comments`
4. Add to Railway variables:
   ```
   INSTAGRAM_PAGE_ID       = [your page ID]
   INSTAGRAM_ACCESS_TOKEN  = [your token]
   INSTAGRAM_APP_SECRET    = [your app secret]
   INSTAGRAM_VERIFY_TOKEN  = cvpro_insta_verify_2024
   ```

---

### STEP 9 — Set Up Appsmith Dashboard

1. Go to [app.appsmith.com](https://app.appsmith.com) → **Create New**
2. Click the three-dot menu → **Import** → **Import from file**
3. Upload `appsmith/dashboard.json`
4. Once imported, go to **Datasources** and update the Supabase URL and keys:
   - URL: `https://YOUR-PROJECT.supabase.co/rest/v1`
   - Headers: `apikey` = your Supabase anon key
5. In JS Objects, update the n8n webhook URL to your Railway URL
6. Click **Deploy**

---

## ✅ Testing Checklist

```
□ Open n8n URL → can log in
□ Workflow 01 (WhatsApp) is ACTIVE
□ Workflow 02 (Instagram) is ACTIVE
□ Send a WhatsApp message to your test number → AI replies
□ Send a DM on Instagram → AI replies
□ Upload a CV via WhatsApp → CV analysis returned
□ Appsmith dashboard shows conversations
□ Analytics workflow runs at midnight (check execution log)
```

---

## 🛑 Troubleshooting

| Problem | Fix |
|---|---|
| n8n won't start | Check Railway logs. Ensure all `DB_POSTGRESDB_*` vars are set correctly |
| Webhook not receiving | Verify `WEBHOOK_URL` matches your Railway public URL exactly |
| Gemini errors | Check `GEMINI_API_KEYS` has no spaces. Test one key at `aistudio.google.com` |
| Supabase connection fails | Use Transaction Pooler host (port 5432), not direct connection (port 5432 for Session mode) |
| Upstash errors | Confirm `UPSTASH_REDIS_REST_URL` starts with `https://` |
| WhatsApp webhook 403 | `WHATSAPP_WEBHOOK_VERIFY_TOKEN` must match exactly in Meta and Railway |

---

## 📁 Project Structure

```
cvpro-n8n/
├── Dockerfile.n8n              ← Railway builds this
├── railway.toml                ← Railway deployment config
├── .env.railway                ← All variables template (DO NOT commit real values)
├── .gitignore
├── README.md
│
├── n8n/
│   └── workflows/
│       ├── 01-whatsapp-webhook.json
│       ├── 02-instagram-webhook.json
│       ├── 03-cv-analyzer.json
│       ├── 04-sales-agent.json
│       ├── 05-memory-system.json
│       ├── 06-file-processor.json
│       ├── 07-follow-up-cron.json
│       ├── 08-broadcast-sender.json
│       ├── 09-human-takeover.json
│       ├── 10-analytics-daily.json
│       └── 11-lead-scoring.json
│
├── scripts/
│   ├── cvpro-helpers.js        ← Supabase + conversation helpers (used by workflows)
│   ├── gemini-rotation.js      ← Gemini key rotator (Upstash-backed)
│   ├── upstash-redis-adapter.js← Redis HTTP adapter (no TCP needed)
│   └── usage-examples.js       ← Copy-paste snippets for n8n Code nodes
│
├── supabase/
│   └── schema.sql              ← Full DB schema (run once in Supabase SQL Editor)
│
└── appsmith/
    └── dashboard.json          ← Import into Appsmith Cloud
```

---

## 💰 Free Tier Limits & What to Watch

| Service | Free Limit | Watch for |
|---|---|---|
| Railway | 500 hours/month ($5 credit) | Keep only 1 service active |
| Supabase | 500MB DB, 1GB storage, 50MB transfer | Vector embeddings grow fast |
| Upstash Redis | 10,000 commands/day | Each message = ~3-5 commands |
| Gemini API | ~60 RPM per key | 6 keys = ~360 RPM total |
| Appsmith Cloud | Unlimited apps, 1000 queries/month | Analytics page is heavy |

---

*Built for UAE/Gulf market · Arabic + English · CVPro.ae*

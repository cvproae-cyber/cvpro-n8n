# CVPro n8n — Full Installation Guide (No Git Required)

This guide deploys the entire stack for **$0/month** using free tiers only.

---

## Part 0 — Which Supabase Account?

The database was created on **the Supabase account connected to your Cursor IDE** (Supabase plugin).

| Field | Value |
|---|---|
| **Organization name** | `cvpro` |
| **Organization plan** | Free |
| **Project name** | `CV PRO CRM` |
| **Project ref (ID)** | `ityxmafonqiffpmdrpar` |
| **Region** | `eu-west-1` (Ireland — close to UAE) |
| **Dashboard URL** | https://supabase.com/dashboard/project/ityxmafonqiffpmdrpar |

### How to confirm it's YOUR account

1. Open https://supabase.com and sign in.
2. Check the top-left organization switcher — you should see **cvpro**.
3. Open project **CV PRO CRM**.
4. Go to **Table Editor** — you should see tables: `customers`, `conversations`, `messages`, `templates`, etc.
5. Open **templates** — should have **4 rows** (welcome_ar, welcome_en, etc.).

### If you DON'T see this project

The project is on a **different Supabase login** (e.g. another email). You have two options:

**Option A — Use that account**  
Sign in with the email that owns organization `cvpro`.

**Option B — Create your own project (recommended if unsure)**  
1. Supabase → **New Project** → name it `cvpro`, region `West EU (Ireland)`.
2. **SQL Editor** → paste entire file `supabase/schema.sql` → **Run**.
3. Update `supabase/project.json` and Railway variables with your new project URL and keys.

---

## Part 1 — Accounts You Need (All Free)

Create these before deploying (use the same email if possible):

| # | Service | Sign up | Purpose |
|---|---|---|---|
| 1 | Supabase | https://supabase.com | Database + storage |
| 2 | Railway | https://railway.app | Host n8n (Docker) |
| 3 | Upstash | https://console.upstash.com | Redis cache (HTTP) |
| 4 | Google AI Studio | https://aistudio.google.com | Gemini API keys |
| 5 | Meta Developers | https://developers.facebook.com | WhatsApp + Instagram |
| 6 | Appsmith | https://app.appsmith.com | CRM dashboard (optional) |

---

## Part 2 — Upload Code Without Installing Git

You have **two methods**. Pick one.

---

### Method A — GitHub Website Upload (easiest, no Git install)

You only use the **browser**. No `git` command needed.

#### Step A1 — Create empty repo on GitHub

1. Go to https://github.com → sign in.
2. Click **+** → **New repository**.
3. Name: `cvpro-n8n`
4. Set to **Private** (recommended — contains config templates).
5. Do **NOT** add README or .gitignore.
6. Click **Create repository**.

#### Step A2 — Upload files via browser

1. On the new repo page, click **uploading an existing file** (or **Add file → Upload files**).
2. Open folder on your PC:  
   `c:\Users\ahmed\Desktop\Najah hub\cvpro-n8n\cvpro-n8n`
3. Select **ALL files and folders** inside it:
   - `Dockerfile.n8n`
   - `railway.toml`
   - `.env.railway` (template only — no real secrets)
   - `scripts/` folder
   - `n8n/workflows/` folder (all 11 JSON files)
   - `supabase/` folder
   - `appsmith/` folder
   - `README.md`, `INSTALL-GUIDE.md`, etc.
4. Click **Commit changes**.

> **Tip:** If browser upload fails for nested folders, upload in batches: first root files, then create folders on GitHub and upload into each.

#### Step A3 — Connect Railway to GitHub

1. Go to https://railway.app → sign in (GitHub login is fine — that's OAuth in browser, not Git install).
2. **New Project** → **Deploy from GitHub repo**.
3. Authorize Railway to access GitHub if asked.
4. Select repository **cvpro-n8n**.
5. Railway detects `Dockerfile.n8n` and `railway.toml` automatically.
6. Wait 3–5 minutes for first build.

---

### Method B — Railway CLI Upload (no GitHub at all)

#### Step B1 — Install Railway CLI

Open **PowerShell** and run:

```powershell
npm install -g @railway/cli
```

(Requires Node.js from https://nodejs.org if not installed.)

#### Step B2 — Login and deploy from folder

```powershell
cd "c:\Users\ahmed\Desktop\Najah hub\cvpro-n8n\cvpro-n8n"
railway login
railway init
railway up
```

This uploads your local folder directly to Railway — **no Git, no GitHub**.

#### Step B3 — Get public URL

```powershell
railway domain
```

Or in Railway dashboard → your service → **Settings → Networking → Generate Domain**.

---

## Part 3 — Supabase Keys (Required for Railway)

Open: https://supabase.com/dashboard/project/ityxmafonqiffpmdrpar/settings/api

Copy these:

| Key | Where | Used for |
|---|---|---|
| **Project URL** | API → URL | `SUPABASE_URL` |
| **anon public** | API → Project API keys | `SUPABASE_ANON_KEY`, Appsmith |
| **service_role** | API → Project API keys (Reveal) | `SUPABASE_SERVICE_ROLE_KEY` — **secret, Railway only** |

Open: https://supabase.com/dashboard/project/ityxmafonqiffpmdrpar/settings/database

| Key | Where | Used for |
|---|---|---|
| **Database password** | You set this when creating project | `DB_POSTGRESDB_PASSWORD` |
| **Pooler host** | Connection string → Transaction pooler | `DB_POSTGRESDB_HOST` |

Pre-filled values for project `ityxmafonqiffpmdrpar`:

```
SUPABASE_URL=https://ityxmafonqiffpmdrpar.supabase.co
DB_POSTGRESDB_HOST=aws-0-eu-west-1.pooler.supabase.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres.ityxmafonqiffpmdrpar
DB_POSTGRESDB_SCHEMA=n8n
DB_POSTGRESDB_SSL_ENABLED=true
```

---

## Part 4 — Railway Environment Variables

Railway → your service → **Variables** tab → add each variable:

### 4.1 — n8n core

```
N8N_ENCRYPTION_KEY=<random 32 chars — e.g. a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6>
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<choose a strong password>
N8N_PROTOCOL=https
N8N_PORT=5678
N8N_LISTEN_ADDRESS=0.0.0.0
GENERIC_TIMEZONE=Asia/Dubai
N8N_ENDPOINT_HEALTH=healthz
NODE_FUNCTION_ALLOW_BUILTIN=*
NODE_FUNCTION_ALLOW_EXTERNAL=/home/node/scripts
N8N_LOG_LEVEL=warn
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=24
```

After first deploy, add (replace with your Railway domain):

```
WEBHOOK_URL=https://YOUR-APP.up.railway.app
N8N_HOST=YOUR-APP.up.railway.app
```

### 4.2 — Supabase (from Part 3)

```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=aws-0-eu-west-1.pooler.supabase.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres.ityxmafonqiffpmdrpar
DB_POSTGRESDB_PASSWORD=<your supabase db password>
DB_POSTGRESDB_SCHEMA=n8n
DB_POSTGRESDB_SSL_ENABLED=true
DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=false

SUPABASE_URL=https://ityxmafonqiffpmdrpar.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard>
SUPABASE_ANON_KEY=<from supabase dashboard>
```

### 4.3 — Upstash Redis (free)

1. https://console.upstash.com → **Create Database**
2. Name: `cvpro-redis`, region closest to UAE
3. Open database → **REST API** tab

```
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
```

### 4.4 — Gemini (free)

1. https://aistudio.google.com → **Get API key**
2. Create 1–3 keys (optional: use different Google accounts for more quota)

```
GEMINI_API_KEYS=AIzaSy...,AIzaSy...
```

(No spaces between keys, comma-separated.)

### 4.5 — WhatsApp (Meta)

From https://developers.facebook.com → Your App → WhatsApp → API Setup:

```
WHATSAPP_PHONE_NUMBER_ID=<from Meta>
WHATSAPP_BUSINESS_ACCOUNT_ID=<from Meta>
WHATSAPP_ACCESS_TOKEN=<permanent token>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=cvpro_verify_2024_random
```

### 4.6 — Instagram (Meta)

```
INSTAGRAM_PAGE_ID=<page id>
INSTAGRAM_ACCESS_TOKEN=<token>
INSTAGRAM_APP_SECRET=<app secret>
INSTAGRAM_VERIFY_TOKEN=cvpro_insta_verify_2024
```

> WhatsApp/Instagram can be added **later**. n8n will start without them.

---

## Part 5 — Import n8n Workflows

1. Open Railway URL: `https://YOUR-APP.up.railway.app`
2. Login: `admin` / your `N8N_BASIC_AUTH_PASSWORD`
3. Sidebar → **Workflows**
4. For each file in `n8n/workflows/`, click **⋯ → Import from file**:

| # | File |
|---|---|
| 1 | `01-whatsapp-webhook.json` |
| 2 | `02-instagram-webhook.json` |
| 3 | `03-cv-analyzer.json` |
| 4 | `04-sales-agent.json` |
| 5 | `05-memory-system.json` |
| 6 | `06-file-processor.json` |
| 7 | `07-follow-up-cron.json` |
| 8 | `08-broadcast-sender.json` |
| 9 | `09-human-takeover.json` |
| 10 | `10-analytics-daily.json` |
| 11 | `11-lead-scoring.json` |

5. **Activate** each workflow (toggle ON, top-right).

---

## Part 6 — Meta Webhooks

Replace `YOUR-APP` with your Railway domain.

### WhatsApp

Meta App → WhatsApp → Configuration → Webhook:

| Field | Value |
|---|---|
| Callback URL | `https://YOUR-APP.up.railway.app/webhook/whatsapp` |
| Verify token | `cvpro_verify_2024_random` |
| Subscribe | `messages` |

Click **Verify and Save**. If it fails, check Railway logs and that workflow **01** is active.

### Instagram

Meta App → Instagram → Webhooks:

| Field | Value |
|---|---|
| Callback URL | `https://YOUR-APP.up.railway.app/webhook/instagram` |
| Verify token | `cvpro_insta_verify_2024` |
| Subscribe | `messages`, `comments` |

---

## Part 7 — Appsmith Dashboard (optional)

1. https://app.appsmith.com → **Create new** → **Import**
2. Upload `appsmith/dashboard.json`
3. **Datasources → Supabase (REST)**:
   - URL: `https://ityxmafonqiffpmdrpar.supabase.co/rest/v1`
   - Header `apikey`: your Supabase **anon** key
   - Header `Authorization`: `Bearer <anon key>`
4. **Deploy**

For inbox view, query table/view: `inbox_messages`

---

## Part 8 — Testing Checklist

```
□ Supabase Table Editor → templates has 4 rows
□ Railway deploy status = Success
□ Open n8n URL → login works
□ All 11 workflows = Active (green)
□ Send WhatsApp test message → AI replies
□ Supabase → messages table gets new rows
□ Meta webhook shows Verified ✓
```

---

## Part 9 — Troubleshooting

| Problem | Fix |
|---|---|
| n8n won't start | Railway logs → check `DB_POSTGRESDB_PASSWORD` and pooler host |
| Webhook verify fails | Token must match exactly; workflow 01/02 must be Active |
| Gemini errors | Test key at aistudio.google.com; no spaces in `GEMINI_API_KEYS` |
| Supabase empty in Appsmith | Use **anon** key; RLS allows SELECT for anon |
| Code node `require` fails | Ensure `NODE_FUNCTION_ALLOW_EXTERNAL=/home/node/scripts` is set |
| Wrong Supabase account | Create new project + run `schema.sql` (Part 0 Option B) |

---

## Part 10 — Monthly Cost = $0

| Service | Free limit |
|---|---|
| Supabase | 500 MB DB, 1 GB storage |
| Railway | $5 credit/month (~500 hrs) |
| Upstash | 10,000 commands/day |
| Gemini | ~60 requests/min per key |
| Appsmith Cloud | Free tier |
| Meta WhatsApp | 1,000 service conversations/month |

---

## Quick Reference — File Locations on Your PC

```
c:\Users\ahmed\Desktop\Najah hub\cvpro-n8n\cvpro-n8n\
├── Dockerfile.n8n          ← Railway builds this
├── railway.toml
├── .env.railway            ← copy variables from here
├── scripts/                ← copied into Docker
├── n8n/workflows/          ← import into n8n UI
├── supabase/schema.sql     ← run if new Supabase project
├── supabase/project.json   ← connected project info
└── appsmith/dashboard.json ← import to Appsmith
```

---

*CVPro.ae · UAE/Gulf market · Arabic + English*

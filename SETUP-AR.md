# أكمل من هنا — CVPro n8n

## ✅ اللي اتعمل

- إصلاح كل الـ workflows (webhooks GET/POST، conversations، GeminiRotator، helpers)
- إنشاء `scripts/cvpro-helpers.js` للـ Supabase + Meta verify
- ربط Supabase project: **CV PRO CRM** (`ityxmafonqiffpmdrpar`)
- تطبيق schema الأساسي (9 جداول) على Supabase

---

## 🔑 الخطوة 1 — Supabase (✅ جاهز)

المشروع **CV PRO CRM** مربوط ومطبّق عليه الـ schema:

| | |
|---|---|
| **URL** | https://ityxmafonqiffpmdrpar.supabase.co |
| **Project Ref** | `ityxmafonqiffpmdrpar` |
| **الجداول** | 9 جداول + RLS + 4 templates + 1 agent |
| **Storage** | bucket `cv-files` |

**محتاج منك بس:**
1. **Settings → API** → انسخ `service_role` key → Railway
2. **Settings → Database** → انسخ DB password → Railway

---

## 📤 الخطوة 2 — ارفع على GitHub

```powershell
cd "c:\Users\ahmed\Desktop\Najah hub\cvpro-n8n\cvpro-n8n"
git init
git add .
git commit -m "Fix critical workflows and connect Supabase CV PRO CRM"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cvpro-n8n.git
git push -u origin main
```

> لو Git مش مثبت: حمّله من https://git-scm.com/download/win

---

## 🚂 الخطوة 3 — Deploy على Railway (مجاني — $5 credit/شهر)

1. https://railway.app → New Project → Deploy from GitHub → اختر `cvpro-n8n`
2. **Variables** — انسخ من `.env.railway` واملأ:

| Variable | القيمة |
|---|---|
| `SUPABASE_URL` | `https://ityxmafonqiffpmdrpar.supabase.co` |
| `SUPABASE_ANON_KEY` | موجود في `supabase/project.json` |
| `SUPABASE_SERVICE_ROLE_KEY` | من Supabase Dashboard |
| `DB_POSTGRESDB_*` | من Supabase Database settings |
| `GEMINI_API_KEYS` | من aistudio.google.com (مجاني) |
| `UPSTASH_REDIS_*` | من console.upstash.com (مجاني) |
| `N8N_ENCRYPTION_KEY` | `openssl rand -hex 16` |
| `WEBHOOK_URL` | Railway URL بعد أول deploy |

3. بعد Deploy → افتح n8n → Import الـ 11 workflow → **Activate** الكل

---

## 📱 الخطوة 4 — Meta WhatsApp + Instagram (مجاني للاختبار)

**WhatsApp Webhook:**
- URL: `https://YOUR-RAILWAY-URL/webhook/whatsapp`
- Verify Token: `cvpro_verify_2024_random`

**Instagram Webhook:**
- URL: `https://YOUR-RAILWAY-URL/webhook/instagram`
- Verify Token: `cvpro_insta_verify_2024`

---

## ⚡ الخطوة 5 — Upstash Redis (مجاني)

1. https://console.upstash.com → Create Database → `cvpro-redis`
2. انسخ REST URL + Token → Railway Variables

---

## 📊 الخطوة 6 — Appsmith Dashboard (مجاني)

1. https://app.appsmith.com → Import `appsmith/dashboard.json`
2. Datasource URL: `https://ityxmafonqiffpmdrpar.supabase.co/rest/v1`
3. apikey header: anon key من `supabase/project.json`

---

## 🧪 اختبار سريع

```
□ Supabase → Table Editor → templates فيها 4 rows
□ n8n → Workflow 01 ACTIVE
□ Meta → Webhook verified ✅
□ رسالة WhatsApp → رد AI
□ Appsmith → conversations تظهر
```

---

## 💰 تكلفة شهرية = $0

| Service | Free Tier |
|---|---|
| Supabase | 500MB DB + 1GB storage |
| Upstash | 10K commands/day |
| Gemini | ~60 RPM/key (مجاني) |
| Railway | $5 credit/month |
| Appsmith Cloud | مجاني |
| Meta WhatsApp | 1000 محادثة service/شهر مجاناً |

---

## ⚠️ أمان Supabase

RLS **مفعّل** على كل الجداول مع policies read-only للـ `anon` (Appsmith).
n8n يستخدم **service_role key** — يتجاوز RLS للكتابة.

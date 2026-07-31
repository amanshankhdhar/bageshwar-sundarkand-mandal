# ⚙️ Backend — Bageshwar Bala Ji Sundarkand Mandal

Minimal Express API deployed on **Render** (free tier). Full setup
instructions live in [`../guide.md`](../guide.md) under **Phase 2** — this
file is just a quick local-dev reference.

## Local development (Termux)

```bash
cd backend
cp .env.example .env
# edit .env — paste your Firebase service account JSON + choose a CRON_SECRET
npm install
npm start
```

Visit `http://localhost:3000/health` — should return `OK`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | none | Service info |
| GET | `/health` | none | Health check |
| GET | `/api/cleanup-expired-events` | `x-cron-secret` header | Deletes events whose `expiryDate`/`date` has passed |

## Why this backend is intentionally small

The website and the future admin app talk to Firestore **directly** for
normal CRUD (add/edit/delete events, donations, gallery, members) — exactly
like `web/js/admin.js` does today. That's simpler, faster, and free.

This backend exists only for the things Firestore alone can't do:
scheduled cleanup today, and a foundation for future features (blog
RSS/sitemap generation, aggregated stats, richer donation workflows) that
genuinely need a server. It grows only when a real need shows up.

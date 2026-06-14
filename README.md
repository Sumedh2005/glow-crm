# Glow CRM
> The CRM that understands skincare.

An AI-native Mini CRM for D2C skincare brands — built around one idea: every product a customer buys has a lifecycle, and that lifecycle tells you when and how to reach them.

Built for the [Xeno](https://getxeno.com) FDE Internship Assignment — June 2026.

---

## Live

| | |
|---|---|
| Frontend | https://glow-crm.netlify.app |
| Backend API | https://glow-crm-production-f2d6.up.railway.app |
| Channel Service | https://glow-crm-production.up.railway.app |

---

## What it does

- **Replenishment Intelligence** — surfaces restock windows automatically, computed live from product lifespans
- **Churn vs Gap Detection** — distinguishes real churn signals from customers still in their natural cycle
- **Natural Language Segmentation** — describe your audience in plain English, AI builds the filter
- **Send-Time Intelligence** — picks the best send time from real engagement data across past campaigns
- **AI Insights** — live-computed cards that surface who needs attention today and launch campaigns in one click

---

## Stack

Frontend — Next.js, Netlify
Backend — Node.js, Express, Railway
Channel Service — Node.js, Express, Railway (stub)
Database — Supabase (Postgres)
AI — Groq, Llama 3.1 8B

---

## Structure

```
glow-crm/
├── frontend/        → Next.js app
├── backend/         → Express API
└── channel-service/ → Stub messaging service
```

---

## Links

- **Pitch Deck** — https://drive.google.com/file/d/1-yM43-SXEUAD6PhdMrv1uk7EnAJmuaoD/view?usp=sharing
- **Figma** — https://www.figma.com/design/5rMamfnP4DVcdxviYcRvAN/Xeno?node-id=0-1&t=qtnoEzyUxk7qYKe9-1

---

*Built by Sumedh Sawant*
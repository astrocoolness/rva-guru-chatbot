# RVA Guru Chatbot

Simple Grok-powered chatbot with project management.

## Setup

1. Add environment variables in Vercel:
   - `XAI_API_KEY` – your xAI Grok API key
   - Postgres connection string (auto-provisioned by Vercel Postgres)

2. Run migrations / init DB (see `lib/db.ts` or hit `/api/init` once)

3. Point `rva.guru.kieran.ai` CNAME to your Vercel deployment.
# Trigger deploy

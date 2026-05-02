# Horizon India Technologies — Payload CMS Backend

Production-ready Payload CMS backend for a B2B industrial equipment website.

## Stack

- Payload CMS (v3)
- Node.js + TypeScript
- PostgreSQL (Supabase)
- Supabase Storage (bucket: `media`)
- Payload REST API (default)

## Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL`: Supabase Postgres connection string
- `PAYLOAD_SECRET`: random secret
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: **service role key** (server-side only)
- `SUPABASE_STORAGE_BUCKET`: defaults to `media`

## Run locally

Install and start:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin` and create the first admin user.

## What’s included

- **Collections**: `products`, `categories`, `services`, `clients`, `resources`, `leads`, `media`, `users`
- **Global**: `site-settings`
- **Seeded content**: required category slugs + core service items (created on boot if missing)
- **Uploads**: all files are uploaded to Supabase Storage; Payload local disk storage is disabled

## REST API

Payload REST endpoints:

- `/api/products`
- `/api/categories`
- `/api/services`
- `/api/leads`

Filtering by slug is supported via `where`, for example:

- `/api/products?where[slug][equals]=YOUR_SLUG`

Relationship population uses `depth` (default is 2):

- `/api/products?depth=2`

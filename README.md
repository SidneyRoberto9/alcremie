<h1 align="center">Alcremie</h1>

<p align="center">
  A self-hosted anime image gallery that tags every upload on its own — no external
  vision API, no manual labelling — and serves the whole collection over a public read API.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.3.5-000000?style=for-the-badge&logo=nextdotjs">
  <img alt="React" src="https://img.shields.io/badge/React-19.3-087EA4?style=for-the-badge&logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
  <img alt="ONNX Runtime" src="https://img.shields.io/badge/ONNX_Runtime-1.29-005CED?style=for-the-badge&logo=onnx&logoColor=white">
  <img alt="Repo size" src="https://img.shields.io/github/repo-size/SidneyRoberto9/alcremie?style=for-the-badge">
</p>

<img src=".github/1440x1080.png" alt="Alcremie home page: a masonry backdrop, the project title and the images, tags and requests counters">

---

## Overview

Alcremie is the gallery and the API behind it. You drop images into the upload page and
the server does the rest: it runs a vision model locally, derives the Danbooru-style tags
and the content rating, stores the file on Cloudinary and the metadata on PostgreSQL.
Everything the gallery renders is then reachable through the same JSON endpoints any
other application can call.

The tagging model runs **inside the application process** through ONNX Runtime. There is
no third-party classification service in the request path, no per-image cost and no data
leaving the host other than the image upload itself.

**Live instance:** <https://alcremie.naofoibugfoifeature.com.br>

## Features

- **Automatic tagging.** Every upload is classified by [WD ViT Tagger v3](https://huggingface.co/SmilingWolf/wd-vit-tagger-v3), which returns general tags and character names above a configurable confidence threshold.
- **Automatic content rating.** The same inference pass yields one of `general`, `sensitive`, `questionable` or `explicit`. Only the last two are gated behind the age-restricted section.
- **Deduplication by content.** A SHA-256 of the original bytes is unique in the database, so re-uploading the same file is rejected instead of duplicated.
- **Cursor-paginated feed.** The infinite feed walks a composite index by cursor, so page 400 costs what page 1 costs. The numbered gallery keeps OFFSET because it needs "last page".
- **Tag search.** Autocomplete backed by a trigram index (`pg_trgm`), ranked by similarity.
- **Public read API.** Feed, gallery, per-image detail, random image, tag search and collection statistics.
- **Responsive gallery.** Masonry layout, blur placeholders and images delivered straight from Cloudinary at the exact width each breakpoint asks for.

## How an upload is processed

```
 file ──► sharp ──────────► WebP (q90)  ──────────────► Cloudinary (folder: alcremie)
      │
      ├──► sharp ──► 448×448, white padding, BGR, 0-255 float
      │                    │
      │                    └──► ONNX Runtime ──► tag scores ──► tags ≥ 0.35
      │                                        └─► rating (argmax of the 4 rating labels)
      │
      └──► SHA-256 of the original bytes ──► unique key in PostgreSQL
```

Two details matter if you touch the pipeline:

- The model expects the image **padded** to 448×448, never cropped, in **BGR** order and in
  the **0-255** range. Normalising to 0-1 returns plausible-looking garbage instead of an error.
- `is_nsfw` is a generated column derived from the rating (`rating <> 'general' AND rating <> 'sensitive'`),
  so the flag can never drift from the label the model produced.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, standalone output) |
| UI | React 19, Tailwind CSS 3, lucide-react, sonner |
| Database | PostgreSQL 17 with Drizzle ORM and `postgres` (postgres.js) |
| Inference | onnxruntime-node running WD ViT Tagger v3 |
| Image processing | sharp |
| Media storage | Cloudinary |
| Validation | Zod 4 |
| Tooling | Biome (lint/format), Prettier (CSS and Tailwind class order), Husky, lint-staged |
| Tests | Vitest, Testing Library |

## API

All endpoints return JSON and accept no authentication. Timestamps are ISO 8601 strings.

### `GET /api/images`

The feed and the gallery. Three modes, resolved in this order: filtered by tag, cursor
paginated, or page numbered.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | uuid | — | Restricts the result to one tag |
| `cursor` | string | — | Opaque cursor from a previous response |
| `page` | integer ≥ 1 | `1` | Used only when no cursor is given |
| `limit` | 1–100 | `35` | Items per page |
| `nsfw` | `true` \| `false` | `false` | Which side of the rating cutoff to read |

```jsonc
// GET /api/images?limit=2
{
  "data": [
    {
      "id": "0f0a…",
      "cloudinaryId": "alcremie/s1zo3rjx7qjv8inbrcda",
      "cloudinaryVersion": 1789490851,
      "width": 1200,
      "height": 1800,
      "placeholder": "#2b2b31",
      "rating": "general",
      "createdAt": "2026-09-15T16:07:31.000Z"
    }
  ],
  "page": 1,          // page mode only
  "total": 6,         // page mode only
  "totalPage": 1,     // page mode only
  "hasNext": false,   // cursor mode only
  "cursor": null      // cursor mode only
}
```

### `GET /api/images/:id`

One image with its tags joined in. `400` for a malformed uuid, `404` when it does not exist.

### `GET /api/random`

A single random image. `404` when the filtered collection is empty.

| Parameter | Type | Default |
| --- | --- | --- |
| `nsfw` | `true` \| `false` | `false` |

### `GET /api/tags`

Tag autocomplete, ranked by trigram similarity.

| Parameter | Type | Default |
| --- | --- | --- |
| `q` | string ≤ 64 | `""` |
| `limit` | 1–50 | `25` |

### `GET /api/stats`

Collection counters, revalidated every 60 seconds.

```jsonc
{ "statistics": { "images": 6, "tags": 128, "requests": 703 } }
```

## Getting started

### Prerequisites

- Node.js 24 (the project pins `@types/node` 24 and the Docker image runs `node:24-bookworm-slim`)
- PostgreSQL 17 with the `pg_trgm` extension available
- A Cloudinary account
- `npm` — the repository is npm-only, `package-lock.json` is the source of truth

### 1. Install

```bash
git clone git@github.com:SidneyRoberto9/alcremie.git
cd alcremie
npm ci
```

### 2. Configure the environment

Copy `.env.example` to `.env` and fill it in.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | `postgres://user:pass@host:5432/alcremie?sslmode=require` |
| `CLOUDINARY_URL` | yes | `cloudinary://<api_key>:<api_secret>@<cloud_name>`, copied from the Cloudinary console |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD` | no | Cloud name used to build delivery URLs. Read at **build time** — it is inlined into the client bundle |
| `NEXT_PUBLIC_API_URL` | no | Base URL advertised by the UI |

### 3. Provision the database

`pg_trgm` is a prerequisite, not part of the generated migrations: `drizzle-kit migrate`
fails on the trigram index if the extension is missing. Run the provisioning steps in
`drizzle/0000_extensions.sql` once as a superuser, then:

```bash
npm run db:migrate   # applies drizzle/*.sql
npm run seed         # optional: local sample rows backed by public/seed
```

### 4. Fetch the model weights

The weights are 362 MB and gitignored:

```bash
bash scripts/fetch-model.sh   # downloads models/model.onnx and models/selected_tags.csv
```

### 5. Run

```bash
npm run dev     # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build. Prerenders the home page, so it needs a reachable `DATABASE_URL` |
| `npm start` | Serves the build |
| `npm test` | Vitest suite. The database tests need a live PostgreSQL |
| `npm run tc` | `tsc --noEmit` |
| `npm run lint` | Biome check over `src` |
| `npm run biome:fix` | Biome check with `--write` |
| `npm run db:generate` | Generates a migration from `src/db/schema.ts` |
| `npm run db:migrate` | Applies pending migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run seed` | Seeds the local database |

## Docker

The image is multi-stage: the model weights are downloaded in their own layer so they
survive source edits, the build stage prerenders the static routes, and the runner only
carries `.next/standalone`, the weights and the native libraries.

```bash
docker build \
  --build-arg DATABASE_URL="postgres://…" \
  --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD="your-cloud" \
  -t alcremie .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://…" \
  -e CLOUDINARY_URL="cloudinary://…" \
  alcremie
```

Deployment notes:

- `DATABASE_URL` is needed **at build time** as well, because the home page is prerendered
  from the database. On Coolify, flag it as a Build Variable. It is passed through `ENV`
  indirection so the credentials never reach the build log.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD` is inlined into the client bundle — changing it requires a
  rebuild, not a restart.
- The image ships a `HEALTHCHECK` that polls `/api/stats`, so an unreachable database marks
  the container unhealthy.

## Project structure

```
src/
├── app/
│   ├── (app)/           # Gallery, recent, nsfw, upload — the rendered pages
│   └── api/             # Public JSON endpoints
├── components/          # UI, grouped by the screen that owns it
├── db/                  # Drizzle schema and client
├── hooks/               # Client-side state (upload queue, tag search)
├── services/            # Queries and inference — everything that talks to a backing service
├── types/               # Types derived from the schema
└── utils/               # Pure helpers (Cloudinary URLs, image loader, formatting)

drizzle/                 # Generated migrations and provisioning SQL
models/                  # ONNX weights and label vocabulary (gitignored)
scripts/                 # Model download and seeding
```

## Testing

```bash
npm test
```

The suite covers URL building, the image loader, feed pagination, cursor encoding and the
database constraints. The database-backed tests expect PostgreSQL on the `DATABASE_URL`
from `.env.local`; without it those files fail on connection, not on assertions.

## Credits

Tagging is powered by [SmilingWolf/wd-vit-tagger-v3](https://huggingface.co/SmilingWolf/wd-vit-tagger-v3).
The tag vocabulary follows the Danbooru category scheme.

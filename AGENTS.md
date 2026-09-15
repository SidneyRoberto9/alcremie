<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Alcremie

Anime image gallery with offline ONNX auto-tagging and a public read API. See `README.md`
for what the product does; this file is what you need before changing it.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Type check | `npm run tc` |
| Lint | `npm run lint` (Biome over `src`) |
| Autofix | `npm run biome:fix` |
| Tests | `npm test` (Vitest) |
| Build | `npm run build` — prerenders the home page, needs a reachable `DATABASE_URL` |
| Migrations | `npm run db:generate` then `npm run db:migrate` |

**npm only.** No pnpm, no yarn, no bun. `package-lock.json` is the source of truth.

## Pinned versions

Next `16.3.5`, React `19.3.0`, TypeScript `5.9` (not 7), Tailwind `3.4` (not 4), Zod `4`,
Biome `2.5`. These are deliberate: Tailwind 4 changes the whole config format and the
plugins in use are v3, and the TypeScript 7 native compiler is too new for the Next plugin.
Do not bump them as a side effect of another change.

## Code conventions

- Arrow functions for components and helpers. Named exports everywhere except App Router
  files (`page.tsx`, `layout.tsx`, `route.ts`), which need a default export.
- Absolute imports through `@/`. No `../..` chains.
- Explicit `<Fragment>` from React, never the `<>` shorthand.
- Tailwind classes only from the palette tokens in `tailwind.config.ts` (`rail`, `sidebar`,
  `content`, `raise`, `line`, `ink`, `accent`, `ok`, `warn`). No raw hex in components.
- `cn()` from `@/lib/cn` to compose conditional classes.
- Icons from `lucide-react`.
- Tests live next to the file they cover (`foo.ts` → `foo.test.ts`).
- Comments explain **why**, in Portuguese, and only where the reason is not obvious from
  the code. Match the density of the file you are editing; do not narrate the diff.
- Conventional Commits, in English, in the imperative mood.

## Architecture

```
src/app/(app)/     rendered pages          src/services/   queries and inference
src/app/api/       public JSON endpoints   src/db/         drizzle schema and client
src/components/    UI, grouped by screen   src/hooks/      client state
src/utils/         pure helpers            src/types/      types derived from the schema
```

Everything that touches PostgreSQL, Cloudinary or the model goes through `src/services`.
The only exception is `src/app/api/images/[id]/route.ts`, which needs the relational query
builder directly — it says so in a comment.

## Things that will bite you

- **Model preprocessing.** `src/services/tagger.ts` feeds the network 448×448 **padded**
  (never cropped), **BGR**, in the **0-255** range. Normalising to 0-1 returns plausible
  garbage with no error at all.
- **`pg_trgm` before migrations.** `drizzle-kit migrate` fails on the trigram index if the
  extension is missing, and the failure is quiet. It is provisioned by
  `drizzle/0000_extensions.sql`, which is not in the drizzle journal.
- **`is_nsfw` is a generated column.** Changing the rating cutoff means dropping and
  re-adding the column in a migration — and recreating `images_feed_idx`, because dropping
  the column takes the index with it.
- **`NEXT_PUBLIC_*` is build time.** `NEXT_PUBLIC_CLOUDINARY_CLOUD` is inlined into the
  client bundle. Changing it needs a rebuild, not a restart.
- **`DATABASE_URL` is needed at build time too**, because the home page is prerendered.
- **Image URLs carry no transformations.** `cloudinaryUrl()` returns the bare delivery URL;
  `src/utils/cloudinary-loader.ts` (wired through `images.loaderFile`) appends the width per
  srcset entry. Putting `w_` back into the src reintroduces the double-compression it fixed.
- **`revalidatePath` needs the request store.** A test that calls a server action directly
  has to mock `next/cache`.
- **Local seed images.** `cloudinaryId` starting with `seed/` resolves to `public/seed/*.webp`
  instead of a remote URL. Keep that branch alive or dev breaks.

## Verification before claiming done

`npm run tc` and `npm run lint` always. `npm test` when the change touches `src/services`,
`src/db` or `src/utils` — the database-backed tests need PostgreSQL on the `DATABASE_URL`
from `.env.local`.

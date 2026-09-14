# Banco: Postgres + Drizzle do zero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um Postgres próprio com Drizzle dentro do app Next, começando **vazio**, aposentando o `alcremie-api` e o MySQL.

**Architecture:** `src/db/` guarda infra (schema, client). `src/services/` guarda o acesso a dados, seguindo a convenção do eleva-management — nenhum componente importa de `@/db` direto. As leituras viram Server Components e route handlers do App Router, substituindo os 11 controllers do NestJS.

**Tech Stack:** PostgreSQL 17+, drizzle-orm 0.45.2, drizzle-kit 0.31.10, postgres.js 3.4.9, Next 16.3.5, zod 4.6.5, Vitest 5, onnxruntime-node 1.29.0, sharp 0.35.4.

**Spec:** `docs/superpowers/plans/2026-09-13-convencoes-e-stack.md` (convenções e versões) · [Alcremie no Postgres](https://claude.ai/code/artifact/a8fe9fdc-b63f-440a-b4d0-941e5e90f0ed) · [Anatomia do Alcremie](https://claude.ai/code/artifact/0f8dc467-12df-4b3a-9b8b-440ccfc54b1b)

## Global Constraints

Tudo em `2026-09-13-convencoes-e-stack.md` vale aqui. O essencial:

- **npm**, nunca pnpm/yarn/bun. Commits pela skill `auto-commit`, nunca `git commit` direto.
- **Estilo:** aspas duplas, **sem ponto e vírgula**, 120 colunas, arrow functions, arquivos kebab-case, named exports. Biome 2.5.13 + Prettier 3.9.6.
- **Sem migração de dados.** Nem do MySQL, nem reingestão do Cloudinary. O banco sobe vazio e enche pelo upload real.
- Postgres 17+, `sslmode=require` sempre. Todo timestamp é `timestamptz`.
- Nenhum componente importa de `@/db`. Sempre de `@/services`.
- Arquivos de referência prontos em `/home/sid/www/personal/alcremie-db/`. Copiar, não reescrever.
- Este plano depende da **Tarefa 1 do plano da UI** (scaffold Next 16 + Biome + estrutura de pastas). Faça-a antes da Onda 1 daqui.

---

## Onda 0 — Provisionar

### Task 1: Postgres no domínio próprio

**Files:**
- Create: `.env.local` (não versionado)
- Modify: `.env.example`

**Interfaces:**
- Produces: `DATABASE_URL` — `postgres://alcremie_app:…@db.seudominio:5432/alcremie?sslmode=require`

- [ ] **Step 1: Criar banco e role**

```sql
CREATE DATABASE alcremie;
CREATE ROLE alcremie_app LOGIN PASSWORD '<senha forte>';
GRANT CONNECT ON DATABASE alcremie TO alcremie_app;
\c alcremie
GRANT USAGE, CREATE ON SCHEMA public TO alcremie_app;
```

- [ ] **Step 2: Confirmar versão e TLS**

Run: `psql "$DATABASE_URL" -c "SELECT version(); SHOW ssl;"`
Expected: 17 ou maior, `ssl` = `on`. Se vier `off`, **parar** — o banco tem domínio público.

- [ ] **Step 3: Registrar no exemplo**

```bash
cat >> .env.example <<'EOF'
DATABASE_URL=postgres://user:pass@host:5432/alcremie?sslmode=require
CLOUDINARY_URL=cloudinary://key:secret@cloud
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
EOF
```

- [ ] **Step 4: Commit** — invocar a skill `auto-commit`.

---

## Onda 1 — Schema

### Task 2: Drizzle no repositório

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`, `drizzle/0000_extensions.sql`
- Modify: `package.json`
- Test: `src/db/schema.test.ts`

**Interfaces:**
- Produces: tabelas `users`, `images`, `tags`, `imageTags`, `favorites`, `counters`; enums `userRole`, `imageRating`, `tagCategory`; `db` exportado de `src/db/client.ts`

- [ ] **Step 1: Instalar**

```bash
npm i drizzle-orm@0.45.2 postgres@3.4.9
npm i -D drizzle-kit@0.31.10 tsx vitest@5.0.0
```

- [ ] **Step 2: Copiar o schema pronto**

```bash
mkdir -p src/db drizzle
cp /home/sid/www/personal/alcremie-db/schema.ts src/db/schema.ts
cp /home/sid/www/personal/alcremie-db/drizzle.config.ts drizzle.config.ts
cp /home/sid/www/personal/alcremie-db/migrations/0000_extensions.sql drizzle/0000_extensions.sql
npx biome check --write src/db drizzle.config.ts
```

Em `drizzle.config.ts`: `schema: "./src/db/schema.ts"`, `out: "./drizzle"`. O `biome check --write` já converte o arquivo copiado para o estilo da casa (aspas duplas, sem ponto e vírgula).

- [ ] **Step 3: Escrever o client**

```ts
// src/db/client.ts
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

// Vercel serverless abre uma conexão por invocação; self-hosted é processo longo.
const max = process.env.VERCEL ? 1 : 10

const client = postgres(process.env.DATABASE_URL as string, { max })

export const db = drizzle(client, { schema })
```

- [ ] **Step 4: Criar a extensão**

Run: `psql "$DATABASE_URL" -f drizzle/0000_extensions.sql`
Expected: `CREATE EXTENSION`. Se der `permission denied`, rodar como superuser — `alcremie_app` não cria extensão.

- [ ] **Step 5: Gerar e ler o SQL antes de aplicar**

```bash
npx drizzle-kit generate
```

Conferir no `.sql` gerado: `is_nsfw` saiu como `GENERATED ALWAYS AS (rating <> 'general') STORED`; `images_feed_idx` tem `DESC` nas duas últimas colunas; `image_tags` tem PK composta **e** `image_tags_by_tag_idx`.

- [ ] **Step 6: Aplicar**

Run: `npx drizzle-kit migrate`
Expected: sem erro. Falha em `gin_trgm_ops` significa que o Step 4 não rodou.

- [ ] **Step 7: Escrever o teste**

```ts
// src/db/schema.test.ts
import { eq, sql } from "drizzle-orm"
import { afterAll, expect, test } from "vitest"
import { db } from "@/db/client"
import { images } from "@/db/schema"

const base = {
  cloudinaryVersion: 1,
  width: 100,
  height: 200,
  bytes: 1234,
}

afterAll(async () => {
  await db.delete(images).where(sql`${images.cloudinaryId} LIKE 'test/%'`)
})

test("is_nsfw é derivado do rating, não gravado", async () => {
  const [row] = await db
    .insert(images)
    .values({ ...base, contentHash: "a".repeat(64), cloudinaryId: "test/derived", rating: "explicit" })
    .returning({ id: images.id, isNsfw: images.isNsfw })

  expect(row.isNsfw).toBe(true)

  const [safe] = await db
    .insert(images)
    .values({ ...base, contentHash: "b".repeat(64), cloudinaryId: "test/safe", rating: "general" })
    .returning({ isNsfw: images.isNsfw })

  expect(safe.isNsfw).toBe(false)
})

test("content_hash duplicado é rejeitado", async () => {
  const values = { ...base, contentHash: "c".repeat(64), cloudinaryId: "test/dup-1", rating: "general" as const }

  await db.insert(images).values(values)

  await expect(db.insert(images).values({ ...values, cloudinaryId: "test/dup-2" })).rejects.toThrow()
})

test("apagar imagem leva as tags junto, sem código nenhum", async () => {
  const [row] = await db
    .insert(images)
    .values({ ...base, contentHash: "d".repeat(64), cloudinaryId: "test/cascade", rating: "general" })
    .returning({ id: images.id })

  await db.delete(images).where(eq(images.id, row.id))

  const orphans = await db.execute(sql`SELECT count(*)::int AS n FROM image_tags WHERE image_id = ${row.id}`)

  expect(orphans[0].n).toBe(0)
})
```

- [ ] **Step 8: Rodar**

Run: `npx vitest run src/db/schema.test.ts`
Expected: 3 passed. Se o primeiro falhar com `isNsfw: false`, a coluna foi criada como boolean comum — reveja o SQL do Step 5.

- [ ] **Step 9: Commit** — invocar a skill `auto-commit`.

---

## Onda 2 — Camada de acesso

### Task 3: Services

**Files:**
- Create: `src/services/images.ts`, `src/services/tags.ts`, `src/services/stats.ts`, `src/services/favorites.ts`, `src/types/image.ts`
- Test: `src/services/images.test.ts`

**Interfaces:**
- Consumes: `db` (Task 2)
- Produces:
  - `src/services/images.ts` — `fetchImagePage({ nsfw, page, limit?, total? })`, `fetchImageFeed({ nsfw, limit?, cursor? })`, `fetchImagesByTag({ tagId, nsfw, limit?, cursor? })`, `randomImage(nsfw?)`, `createImageWithTags(image, detected)`, `encodeCursor(cursor)`, `decodeCursor(raw)`
  - `src/services/tags.ts` — `searchTags(term, limit?)`
  - `src/services/stats.ts` — `getStatistics()`
  - `src/services/favorites.ts` — `toggleFavorite(userId, imageId)`
  - `src/types/image.ts` — `type FeedImage`, `type Cursor = { createdAt: Date; id: string }`

- [ ] **Step 1: Copiar e repartir as queries prontas**

```bash
cp /home/sid/www/personal/alcremie-db/queries.ts src/services/images.ts
```

Remover do topo a criação do client e trocar por `import { db } from "@/db/client"`. Mover `searchTags` para `src/services/tags.ts`, `getStatistics` para `stats.ts`, `toggleFavorite` para `favorites.ts`. Renomear `fetchFeed` → `fetchImageFeed`, `fetchPage` → `fetchImagePage`, `fetchByTag` → `fetchImagesByTag`. Rodar `npx biome check --write src/services`.

- [ ] **Step 2: Cursor codificado no service, não no handler**

```ts
// src/services/images.ts — no fim do arquivo
export const encodeCursor = (cursor: Cursor) =>
  Buffer.from(JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.id })).toString("base64url")

export const decodeCursor = (raw: string | undefined): Cursor | undefined => {
  if (!raw) {
    return undefined
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString())
    return { createdAt: new Date(parsed.c), id: parsed.i }
  } catch {
    return undefined
  }
}
```

Cursor malformado devolve `undefined` (primeira página), não estoura. É entrada de usuário.

- [ ] **Step 3: Teste do cursor — onde erro é silencioso**

```ts
// src/services/images.test.ts
import { inArray } from "drizzle-orm"
import { afterAll, beforeAll, expect, test } from "vitest"
import { db } from "@/db/client"
import { images } from "@/db/schema"
import { decodeCursor, encodeCursor, fetchImageFeed } from "@/services/images"

const HASHES = Array.from({ length: 5 }, (_, i) => `f${i}`.padEnd(64, "0"))

beforeAll(async () => {
  await db.insert(images).values(
    HASHES.map((contentHash, i) => ({
      contentHash,
      cloudinaryId: `test/cursor-${i}`,
      cloudinaryVersion: 1,
      width: 100,
      height: 100,
      bytes: 1,
      rating: "general" as const,
      createdAt: new Date(Date.UTC(2020, 0, 1 + i)),
    }))
  )
})

afterAll(async () => {
  await db.delete(images).where(inArray(images.contentHash, HASHES))
})

test("o cursor não repete nem pula linhas", async () => {
  const first = await fetchImageFeed({ nsfw: false, limit: 2 })
  expect(first.data).toHaveLength(2)
  expect(first.hasNext).toBe(true)

  const second = await fetchImageFeed({ nsfw: false, limit: 2, cursor: first.cursor ?? undefined })

  const ids = [...first.data, ...second.data].map((row) => row.id)
  expect(new Set(ids).size).toBe(ids.length)

  const dates = [...first.data, ...second.data].map((row) => row.createdAt.getTime())
  expect(dates).toEqual([...dates].sort((a, b) => b - a))
})

test("cursor malformado cai na primeira página em vez de estourar", () => {
  expect(decodeCursor("lixo")).toBeUndefined()
  expect(decodeCursor(undefined)).toBeUndefined()

  const round = { createdAt: new Date("2020-01-01T00:00:00.000Z"), id: "abc" }
  expect(decodeCursor(encodeCursor(round))).toEqual(round)
})
```

- [ ] **Step 4: Rodar**

Run: `npx vitest run src/services/images.test.ts`
Expected: 2 passed. Id repetido entre páginas significa que o desempate por `id` no `or(...)` está errado.

- [ ] **Step 5: Commit** — invocar a skill `auto-commit`.

---

## Onda 3 — Rotas

### Task 4: Route handlers

**Files:**
- Create: `src/app/api/images/route.ts`, `src/app/api/images/[id]/route.ts`, `src/app/api/tags/route.ts`, `src/app/api/random/route.ts`, `src/app/api/stats/route.ts`
- Test: `src/app/api/images/route.test.ts`

**Interfaces:**
- Consumes: services da Task 3
- Produces: `GET /api/images?page&limit&nsfw&tag&cursor`, `GET /api/images/:id`, `GET /api/tags?q&limit`, `GET /api/random?nsfw`, `GET /api/stats`

- [ ] **Step 1: Validar de verdade — o que o Nest declarava e não aplicava**

```ts
// src/app/api/images/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { decodeCursor, encodeCursor, fetchImagePage, fetchImagesByTag } from "@/services/images"

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(35),
  nsfw: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  tag: z.uuid().optional(),
  cursor: z.string().max(256).optional(),
})

export const GET = async (request: NextRequest) => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  const { page, limit, nsfw, tag, cursor } = parsed.data

  if (tag) {
    const result = await fetchImagesByTag({ tagId: tag, nsfw, limit, cursor: decodeCursor(cursor) })

    return NextResponse.json({
      data: result.data,
      hasNext: result.hasNext,
      cursor: result.cursor ? encodeCursor(result.cursor) : null,
    })
  }

  return NextResponse.json(await fetchImagePage({ nsfw, page, limit }))
}
```

`z.uuid()` e `z.treeifyError()` são a forma do zod 4 — no zod 3 seriam `z.string().uuid()` e `error.flatten()`.

- [ ] **Step 2: Teste dos limites**

```ts
// src/app/api/images/route.test.ts
import { NextRequest } from "next/server"
import { expect, test } from "vitest"
import { GET } from "@/app/api/images/route"

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/images${qs}`))

test("page fora de faixa é rejeitado, não coagido", async () => {
  expect((await call("?page=0")).status).toBe(400)
  expect((await call("?page=-5")).status).toBe(400)
  expect((await call("?page=abc")).status).toBe(400)
})

test("limit tem teto", async () => {
  expect((await call("?limit=99999")).status).toBe(400)
})

test("tag precisa ser uuid", async () => {
  expect((await call("?tag=1girl")).status).toBe(400)
})

test("cursor lixo não derruba a rota", async () => {
  expect((await call("?tag=00000000-0000-4000-8000-000000000000&cursor=%%%")).status).toBe(200)
})

test("sem parâmetros devolve a primeira página SFW", async () => {
  const response = await call("")
  expect(response.status).toBe(200)

  const body = await response.json()
  expect(body.page).toBe(1)
  expect(Array.isArray(body.data)).toBe(true)
})
```

- [ ] **Step 3: Rodar**

Run: `npx vitest run src/app/api/images/route.test.ts`
Expected: 5 passed. Na API antiga `/api/image/0` responde 200 — esse teste é a regressão que impede a volta do bug.

- [ ] **Step 4: As outras quatro rotas**

```ts
// src/app/api/tags/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { searchTags } from "@/services/tags"

const querySchema = z.object({
  q: z.string().max(64).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(25),
})

export const GET = async (request: NextRequest) => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  return NextResponse.json({ tags: await searchTags(parsed.data.q, parsed.data.limit) })
}
```

```ts
// src/app/api/random/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { randomImage } from "@/services/images"

export const dynamic = "force-dynamic"

export const GET = async (request: NextRequest) => {
  const image = await randomImage(request.nextUrl.searchParams.get("nsfw") === "true")

  if (!image) {
    return NextResponse.json({ error: "no images" }, { status: 404 })
  }

  return NextResponse.json({ image })
}
```

```ts
// src/app/api/stats/route.ts
import { NextResponse } from "next/server"
import { getStatistics } from "@/services/stats"

export const revalidate = 60

export const GET = async () => NextResponse.json({ statistics: await getStatistics() })
```

```ts
// src/app/api/images/[id]/route.ts
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db/client"
import { images } from "@/db/schema"

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }

  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
    with: { imageTags: { with: { tag: true } } },
  })

  if (!image) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json({ image })
}
```

- [ ] **Step 5: Subir e conferir**

```bash
npm run dev
curl -s localhost:3000/api/stats
curl -s "localhost:3000/api/images?page=0" -o /dev/null -w "%{http_code}\n"
```

Expected: JSON na primeira, `400` na segunda. `/api/stats` devolve zeros — o banco está vazio de propósito.

- [ ] **Step 6: Commit** — invocar a skill `auto-commit`.

---

## Onda 4 — Tagger e seed

### Task 5: Tagger ONNX

**Files:**
- Create: `src/services/tagger.ts`, `models/.gitignore`, `scripts/fetch-model.sh`
- Modify: `package.json`, `.gitignore`
- Test: `src/services/tagger.test.ts`

**Interfaces:**
- Produces: `tagImage(buffer, threshold?) → Promise<DetectedTag[]>`, `ratingOf(buffer) → Promise<ImageRating>`, `type DetectedTag = { name: string; score: number; category: "general" | "character" }`

- [ ] **Step 1: Instalar e baixar o modelo**

```bash
npm i -D onnxruntime-node@1.29.0
npm i sharp@0.35.4
mkdir -p models && printf '*\n!.gitignore\n' > models/.gitignore

cat > scripts/fetch-model.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
BASE="https://huggingface.co/SmilingWolf/wd-vit-tagger-v3/resolve/main"
curl -L --fail -o models/model.onnx "$BASE/model.onnx"
curl -L --fail -o models/selected_tags.csv "$BASE/selected_tags.csv"
EOF
chmod +x scripts/fetch-model.sh && ./scripts/fetch-model.sh
```

Expected: `model.onnx` com ~378 MB, `selected_tags.csv` com 10 862 linhas.

- [ ] **Step 2: Escrever o tagger**

```ts
// src/services/tagger.ts
import { readFileSync } from "node:fs"
import path from "node:path"
import * as ort from "onnxruntime-node"
import sharp from "sharp"

const SIZE = 448
const MODEL = path.join(process.cwd(), "models/model.onnx")
const LABELS = path.join(process.cwd(), "models/selected_tags.csv")

export type ImageRating = "general" | "sensitive" | "questionable" | "explicit"
export type DetectedTag = { name: string; score: number; category: "general" | "character" }

type Label = { name: string; category: number }

let session: ort.InferenceSession | null = null
let labels: Label[] | null = null

const loadLabels = (): Label[] =>
  readFileSync(LABELS, "utf8")
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [, name, category] = line.split(",")
      return { name, category: Number(category) }
    })

/**
 * O tagger espera 448x448 com padding branco (não crop), canais BGR, float 0-255.
 * Normalizar para 0-1 aqui devolve tags aleatórias sem erro nenhum — é o modo de
 * falha silenciosa que o teste do Step 4 existe para pegar.
 */
const preprocess = async (buffer: Buffer): Promise<Float32Array> => {
  const { data } = await sharp(buffer)
    .flatten({ background: "#ffffff" })
    .resize(SIZE, SIZE, { fit: "contain", background: "#ffffff", kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const out = new Float32Array(SIZE * SIZE * 3)

  for (let i = 0; i < SIZE * SIZE; i++) {
    out[i * 3] = data[i * 3 + 2]
    out[i * 3 + 1] = data[i * 3 + 1]
    out[i * 3 + 2] = data[i * 3]
  }

  return out
}

const infer = async (buffer: Buffer) => {
  session ??= await ort.InferenceSession.create(MODEL)
  labels ??= loadLabels()

  const tensor = new ort.Tensor("float32", await preprocess(buffer), [1, SIZE, SIZE, 3])
  const output = await session.run({ [session.inputNames[0]]: tensor })

  return { scores: output[session.outputNames[0]].data as Float32Array, labels }
}

export const tagImage = async (buffer: Buffer, threshold = 0.35): Promise<DetectedTag[]> => {
  const { scores, labels: list } = await infer(buffer)

  return list
    .map((label, index) => ({ ...label, score: scores[index] }))
    .filter((tag) => tag.category !== 9 && tag.score >= threshold)
    .map((tag) => ({
      name: tag.name,
      score: tag.score,
      category: tag.category === 4 ? ("character" as const) : ("general" as const),
    }))
    .sort((a, b) => b.score - a.score)
}

/** As quatro tags de category 9 são mutuamente exclusivas: vence a de maior score. */
export const ratingOf = async (buffer: Buffer): Promise<ImageRating> => {
  const { scores, labels: list } = await infer(buffer)

  const [top] = list
    .map((label, index) => ({ name: label.name, category: label.category, score: scores[index] }))
    .filter((tag) => tag.category === 9)
    .sort((a, b) => b.score - a.score)

  return top.name as ImageRating
}
```

- [ ] **Step 3: Teste que pega preprocessamento errado**

```ts
// src/services/tagger.test.ts
import { readFileSync } from "node:fs"
import { expect, test } from "vitest"
import { ratingOf, tagImage } from "@/services/tagger"

// Guardar uma imagem de anime SFW em fixtures/sample.jpg antes de rodar.
const SAMPLE = readFileSync("fixtures/sample.jpg")

test("tagueia uma imagem de anime com as tags óbvias", { timeout: 60_000 }, async () => {
  const tags = await tagImage(SAMPLE)

  expect(tags.map((tag) => tag.name)).toContain("1girl")
  expect(tags[0].score).toBeGreaterThan(0.8)
  expect(tags.length).toBeGreaterThan(5)
  expect(tags.length).toBeLessThan(80)
})

test("nenhuma tag de rating vaza na lista de tags", { timeout: 60_000 }, async () => {
  const names = (await tagImage(SAMPLE)).map((tag) => tag.name)

  expect(names).not.toContain("general")
  expect(names).not.toContain("explicit")
})

test("o rating é uma das quatro classes", { timeout: 60_000 }, async () => {
  expect(["general", "sensitive", "questionable", "explicit"]).toContain(await ratingOf(SAMPLE))
})
```

- [ ] **Step 4: Rodar**

Run: `npx vitest run src/services/tagger.test.ts`
Expected: 3 passed. Se `1girl` não aparecer ou os scores ficarem todos perto de 0.5, o preprocessamento está errado — reveja BGR e a escala 0-255.

- [ ] **Step 5: Commit** — invocar a skill `auto-commit`.

---

### Task 6: Seed de desenvolvimento

**Files:**
- Create: `scripts/seed.ts`, `fixtures/.gitignore`
- Modify: `package.json`

**Interfaces:**
- Consumes: `tagImage`, `ratingOf` (Task 5); `createImageWithTags` (Task 3)
- Produces: `npm run seed` — 12 imagens locais no banco, para ter o que olhar durante o desenvolvimento

Produção **não** roda isto. Nasce vazia e enche pelo upload real.

- [ ] **Step 1: Escrever o seed**

```ts
// scripts/seed.ts
import { createHash } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { sql } from "drizzle-orm"
import sharp from "sharp"
import { db } from "@/db/client"
import { counters, images, tags } from "@/db/schema"
import { createImageWithTags } from "@/services/images"
import { ratingOf, tagImage } from "@/services/tagger"

if (process.env.NODE_ENV === "production") {
  throw new Error("seed não roda em produção")
}

const DIR = path.join(process.cwd(), "fixtures/seed")
const files = readdirSync(DIR).filter((name) => /\.(jpe?g|png|webp)$/i.test(name))

console.info(`${files.length} arquivos em fixtures/seed`)

let done = 0

for (const name of files) {
  const original = readFileSync(path.join(DIR, name))
  const webp = await sharp(original).webp({ quality: 90 }).toBuffer()
  const meta = await sharp(webp).metadata()

  const [detected, rating] = await Promise.all([tagImage(original), ratingOf(original)])

  const id = await createImageWithTags(
    {
      contentHash: createHash("sha256").update(webp).digest("hex"),
      // Sem Cloudinary no seed: o id aponta para um arquivo servido de /public.
      cloudinaryId: `seed/${path.parse(name).name}`,
      cloudinaryVersion: 1,
      width: meta.width as number,
      height: meta.height as number,
      bytes: webp.byteLength,
      format: "webp",
      rating,
    },
    detected
  )

  if (id) {
    done++
    console.info(`${name} → ${rating}, ${detected.length} tags`)
  }
}

const [{ n: imageCount }] = await db.select({ n: sql<number>`count(*)::int` }).from(images)
const [{ n: tagCount }] = await db.select({ n: sql<number>`count(*)::int` }).from(tags)

await db
  .insert(counters)
  .values([
    { key: "images", value: imageCount },
    { key: "tags", value: tagCount },
    { key: "requests", value: 0 },
  ])
  .onConflictDoUpdate({ target: counters.key, set: { value: sql`excluded.value` } })

console.info({ done, imageCount, tagCount })
process.exit(0)
```

- [ ] **Step 2: Scripts no package.json**

```json
"seed": "tsx scripts/seed.ts",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 3: Rodar**

```bash
mkdir -p fixtures/seed
cp /home/sid/www/personal/alcremie-design/a*.jpg fixtures/seed/
npm run seed
```

Expected: 10 linhas com rating e contagem de tag. Abrir `npm run db:studio` e conferir que `image_tags.score` está preenchido — é a coluna que o schema antigo não tinha.

- [ ] **Step 4: Confirmar o plano da listagem com dados**

```bash
psql "$DATABASE_URL" -c "ANALYZE;"
psql "$DATABASE_URL" -c "EXPLAIN ANALYZE SELECT id FROM images WHERE is_nsfw = false ORDER BY created_at DESC, id DESC LIMIT 35;"
```

Expected: com 10 linhas o planner ainda escolhe `Seq Scan`, e está certo. Repetir quando o acervo real passar de algumas centenas.

- [ ] **Step 5: Commit** — invocar a skill `auto-commit`.

---

## Onda 5 — Corte

### Task 7: Aposentar o NestJS e o MySQL

**Files:**
- Modify: `.env.example`
- Delete: nada no repositório `alcremie`

- [ ] **Step 1: Conferir que nada aponta para o host antigo**

```bash
grep -rn "NEXT_PUBLIC_API_URL\|alcremie-api" src/ .env.example || echo "limpo"
```

Expected: `limpo`. Se aparecer algo, a Onda 2 do plano da UI não terminou.

- [ ] **Step 2: Clicar em tudo**

Run: `npm run dev`

Percorrer `/`, `/gallery`, `/gallery?tag=…`, `/recent` até o infinite scroll disparar, `/nsfw`, `/upload`. Nenhuma chamada ao host antigo na aba Network.

- [ ] **Step 3: Commit** — invocar a skill `auto-commit`.

- [ ] **Step 4: Arquivar — só depois de uma semana no ar**

```bash
gh repo archive SidneyRoberto9/alcremie-api --yes
```

Desligar o processo Node e o MySQL. Como não houve migração de dados, o MySQL não é rollback de nada — mas o `alcremie-api` ainda serve de referência para qualquer coisa esquecida. Uma semana basta.

---

## Self-Review

**Cobertura do spec:** as seis mudanças do §01 do documento do banco aparecem — FKs (Task 2, provada pelo teste de cascade), rating + coluna gerada (Task 2), score (Task 5 produz, Task 6 grava), width/height (Task 6, do sharp), content_hash (Task 6, sha256 real), `requests` → `counters` (Task 6). Os sete índices saem da Task 2.

**O que mudou nesta revisão:** sumiu a migração de dados (Task 6 virou seed local de 12 imagens), o código passou para o estilo da casa, as queries foram de `src/db/queries.ts` para `src/services/*` seguindo o eleva-management, o zod subiu para a v4 (`z.uuid()`, `z.treeifyError()`) e as versões foram fixadas.

**Lacuna aceita:** `users` e `favorites` nascem vazias. Autenticação é a Onda 4 do plano da UI.

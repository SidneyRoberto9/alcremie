import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
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
const PUBLIC_DIR = path.join(process.cwd(), "public/seed")
const files = readdirSync(DIR).filter((name) => /\.(jpe?g|png|webp)$/i.test(name))

console.info(`${files.length} arquivos em fixtures/seed`)

if (!existsSync(PUBLIC_DIR)) {
  mkdirSync(PUBLIC_DIR, { recursive: true })
}

// Cor dominante em #rrggbb: reduzir a 1x1 já faz a média ponderada pelo
// kernel de resample, então os 3 bytes resultantes são o placeholder — sem
// repetir essa média à mão a partir de sharp().stats().
const dominantColor = async (buffer: Buffer): Promise<string> => {
  const { data } = await sharp(buffer).resize(1, 1).raw().toBuffer({ resolveWithObject: true })
  return `#${Array.from(data.subarray(0, 3))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`
}

// Corpo em função async: sem "type": "module" no package.json, tsx compila
// scripts/*.ts como CJS, que não aceita top-level await — só dentro de uma
// função.
const main = async () => {
  let inserted = 0
  let duplicates = 0

  for (const name of files) {
    const original = readFileSync(path.join(DIR, name))
    const webp = await sharp(original).webp({ quality: 90 }).toBuffer()
    const meta = await sharp(webp).metadata()
    const stem = path.parse(name).name

    const [detected, rating, placeholder] = await Promise.all([
      tagImage(original),
      ratingOf(original),
      dominantColor(webp),
    ])

    const id = await createImageWithTags(
      {
        contentHash: createHash("sha256").update(webp).digest("hex"),
        // Sem Cloudinary no seed: o id aponta para um arquivo servido de /public.
        cloudinaryId: `seed/${stem}`,
        cloudinaryVersion: 1,
        width: meta.width as number,
        height: meta.height as number,
        bytes: webp.byteLength,
        format: "webp",
        placeholder,
        rating,
      },
      detected
    )

    if (id) {
      writeFileSync(path.join(PUBLIC_DIR, `${stem}.webp`), webp)
      inserted++
      console.info(`${name} → ${rating}, ${detected.length} tags, placeholder ${placeholder}`)
    } else {
      duplicates++
      console.info(`${name} → duplicado (content_hash já existe), pulado`)
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

  console.info({ inserted, duplicates, imageCount, tagCount })
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

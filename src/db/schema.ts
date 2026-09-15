import { relations, sql } from "drizzle-orm"
import {
  boolean,
  char,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const userRole = pgEnum("user_role", ["default", "admin"])

/**
 * Os quatro ratings que o tagger devolve (category 9 do selected_tags.csv).
 * Substitui o boolean is_nsfw, que era derivado por comparação de string.
 */
export const imageRating = pgEnum("image_rating", ["general", "sensitive", "questionable", "explicit"])

/** Categorias do vocabulário Danbooru: 0 = general, 4 = character. */
export const tagCategory = pgEnum("tag_category", ["general", "character", "copyright", "artist"])

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    role: userRole("role").notNull().default("default"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_key").on(sql`lower(${t.email})`)]
)

export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Identidade do arquivo, não do provedor: o mesmo binário enviado duas
    // vezes ganha asset_id novo no Cloudinary, mas o hash continua igual.
    contentHash: char("content_hash", { length: 64 }).notNull(),

    // Guarda o public_id, não a URL montada — é o que permite pedir
    // transformações (w_400, f_auto) sem gravar uma URL por tamanho.
    cloudinaryId: text("cloudinary_id").notNull(),
    cloudinaryVersion: integer("cloudinary_version").notNull(),

    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: integer("bytes").notNull(),
    format: text("format").notNull().default("webp"),

    /** Cor dominante em #rrggbb, usada como placeholder enquanto a imagem carrega. */
    placeholder: char("placeholder", { length: 7 }),

    // Incrementado a cada abertura de /images/[id]. Sem contador por imagem
    // antes disso; só existia o total de requests em `counters`, que não diz
    // qual imagem foi vista.
    views: integer("views").notNull().default(0),

    rating: imageRating("rating").notNull(),

    // Mantém o nome e a semântica antigos para as queries não precisarem
    // mudar, mas agora derivado do rating em vez de gravado à mão.
    // sensitive (pose sugestiva, roupa justa) fica fora do corte: o modelo
    // marca assim qualquer ilustração levemente provocante, e mandar tudo isso
    // para /nsfw esvaziava a galeria. Duas comparações em vez de
    // `rating NOT IN (...)`: o IN vira um cast de array que o Postgres recusa
    // como não-imutável numa coluna gerada.
    // prettier-ignore
    isNsfw: boolean("is_nsfw").notNull().generatedAlwaysAs(sql`(rating <> 'general' AND rating <> 'sensitive')`),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("images_content_hash_key").on(t.contentHash),
    uniqueIndex("images_cloudinary_id_key").on(t.cloudinaryId),
    // O índice que toda listagem usa: filtro por is_nsfw, ordem por data.
    // id entra no fim para o cursor ser determinístico com timestamps iguais.
    index("images_feed_idx").on(t.isNsfw, t.createdAt.desc(), t.id.desc()),
  ]
)

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: tagCategory("category").notNull().default("general"),

    // Denormalizado de propósito: a nuvem de tags e o autocomplete ordenam
    // por isso e não podem pagar um COUNT na junção a cada tecla.
    imageCount: integer("image_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("tags_name_key").on(t.name),
    uniqueIndex("tags_slug_key").on(t.slug),
    // Substitui o LIKE '%termo%' que hoje varre a tabela inteira.
    index("tags_name_trgm_idx").using("gin", sql`${t.name} gin_trgm_ops`),
    index("tags_popular_idx").on(t.imageCount.desc()),
  ]
)

export const imageTags = pgTable(
  "image_tags",
  {
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),

    /** Probabilidade que o modelo deu para esta tag nesta imagem. */
    score: real("score"),
  },
  (t) => [
    primaryKey({ columns: [t.imageId, t.tagId] }),
    // O sentido inverso: "todas as imagens desta tag".
    index("image_tags_by_tag_idx").on(t.tagId, t.imageId),
  ]
)

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // A chave composta É a regra de unicidade que faltava: sem ela, nada no
    // banco impedia o mesmo usuário favoritar a mesma imagem duas vezes.
    primaryKey({ columns: [t.userId, t.imageId] }),
    index("favorites_by_user_idx").on(t.userId, t.createdAt.desc()),
  ]
)

/**
 * Substitui a tabela `requests`, que gravava uma linha por requisição HTTP,
 * não tinha índice nem retenção, e era lida por COUNT(*) na home.
 */
export const counters = pgTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const imagesRelations = relations(images, ({ many }) => ({
  imageTags: many(imageTags),
  favorites: many(favorites),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  imageTags: many(imageTags),
}))

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
  image: one(images, { fields: [imageTags.imageId], references: [images.id] }),
  tag: one(tags, { fields: [imageTags.tagId], references: [tags.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  image: one(images, { fields: [favorites.imageId], references: [images.id] }),
}))

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

// A imagem (fixtures/sample.jpg) é uma personagem loira de olhos azuis com um
// capelet vermelho. Isso não é decorativo: cor é exatamente o que um canal
// BGR/RGB trocado destrói. Medido contra a implementação real: trocar os
// canais (RGB em vez de BGR) derruba blonde_hair de 0.96 para 0.06 e
// blue_eyes de 0.90 para 0.01 — os dois caem abaixo do threshold padrão
// (0.35) e desaparecem da lista. As duas asserções "tags óbvias" acima
// (1girl, score > 0.8, contagem 5-80) sobrevivem intactas a essa mesma troca
// de canal, então sozinhas não provam nada sobre a ordem BGR — daí este teste.
test("cores específicas da imagem sobrevivem só com BGR correto", { timeout: 60_000 }, async () => {
  const tags = await tagImage(SAMPLE)
  const names = tags.map((tag) => tag.name)

  expect(names).toContain("blonde_hair")
  expect(names).toContain("blue_eyes")
})

// Category 4 é personagem: "shinku" (Rozen Maiden) é a personagem retratada
// na fixture, mapeada para category: "character" pelo tagger.
test("tag de personagem (category 4) vem marcada como character", { timeout: 60_000 }, async () => {
  const tags = await tagImage(SAMPLE)
  const character = tags.find((tag) => tag.name === "shinku")

  expect(character?.category).toBe("character")
})

test("nenhuma tag de rating vaza na lista de tags", { timeout: 60_000 }, async () => {
  const names = (await tagImage(SAMPLE)).map((tag) => tag.name)

  expect(names).not.toContain("general")
  expect(names).not.toContain("explicit")
})

// Ground truth da fixture: personagem totalmente vestida, sem nudez —
// "general" é o rating correto, não só "uma string válida qualquer". Medido:
// mesmo com BGR/RGB trocado o rating ainda sai "general" (a classificação de
// rating é mais robusta a esse bug do que as tags de cor), então este teste
// não substitui o de cima — ele existe para travar contra uma regressão que
// mude a lógica de category 9 (ex.: pegar o menor score em vez do maior).
test("o rating da fixture é general", { timeout: 60_000 }, async () => {
  expect(await ratingOf(SAMPLE)).toBe("general")
})

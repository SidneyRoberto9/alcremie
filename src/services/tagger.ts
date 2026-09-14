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

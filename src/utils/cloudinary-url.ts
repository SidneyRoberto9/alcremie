const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD ?? "alcremie"

interface Transformable {
  cloudinaryId: string
  cloudinaryVersion: number
}

// O seed local grava webp em public/seed/ com cloudinaryId "seed/<nome>" — esses
// arquivos nunca existiram no Cloudinary, então montar a URL remota para eles
// quebraria toda imagem em dev. O branch de produção usa https e a versão,
// corrigindo a URL http:// que cloudinary.service.ts gravava.
export const cloudinaryUrl = (image: Transformable, width: number) => {
  if (image.cloudinaryId.startsWith("seed/")) {
    return `/${image.cloudinaryId}.webp`
  }

  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_${width},f_auto,q_auto/v${image.cloudinaryVersion}/${image.cloudinaryId}`
}

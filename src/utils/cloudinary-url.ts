const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD ?? "drcqberx9"

interface Transformable {
  cloudinaryId: string
  cloudinaryVersion: number
}

// URL de entrega sem transformação nenhuma: quem escolhe a largura é o
// cloudinary-loader, chamado uma vez por entrada do srcset que o next/image
// monta. Fixar w_ aqui dava uma fonte só — em tela retina o navegador esticava
// os 400px para 800 e a listagem saía borrada.
//
// O seed local grava webp em public/seed/ com cloudinaryId "seed/<nome>" — esses
// arquivos nunca existiram no Cloudinary, então montar a URL remota para eles
// quebraria toda imagem em dev.
export const cloudinaryUrl = (image: Transformable) => {
  if (image.cloudinaryId.startsWith("seed/")) {
    return `/${image.cloudinaryId}.webp`
  }

  return `https://res.cloudinary.com/${CLOUD}/image/upload/v${image.cloudinaryVersion}/${image.cloudinaryId}`
}

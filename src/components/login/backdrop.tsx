import NextImage from "next/image"
import type { FeedImage } from "@/types/image"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

const TILES = 24

interface BackdropProps {
  images: FeedImage[]
}

/**
 * Mosaico do login. Repetir é de propósito: o sorteio pode voltar com menos
 * imagens do que ladrilhos (acervo pequeno) e a tela precisa fechar mesmo
 * assim, então a lista é ciclada. Colunas em CSS `columns` em vez do
 * <Masonry> da galeria porque aquele distribui por id único — aqui a mesma
 * imagem aparece mais de uma vez de propósito.
 */
export const Backdrop = ({ images }: BackdropProps) => {
  if (images.length === 0) {
    return null
  }

  const tiles = Array.from({ length: TILES }, (_, index) => images[index % images.length])

  return (
    <div aria-hidden className="absolute inset-0 -m-6 columns-3 gap-2.5 lg:columns-6">
      {tiles.map((image, index) => (
        <NextImage
          // biome-ignore lint/suspicious/noArrayIndexKey: a mesma imagem repete de propósito, então o id sozinho não é único aqui — e o mosaico é decorativo, nunca reordena
          key={`${image.id}-${index}`}
          src={cloudinaryUrl(image)}
          alt=""
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 34vw, 17vw"
          className="mb-2.5 block w-full break-inside-avoid rounded-lg"
        />
      ))}
    </div>
  )
}

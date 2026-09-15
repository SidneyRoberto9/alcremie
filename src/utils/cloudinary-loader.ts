"use client"

import type { ImageLoaderProps } from "next/image"

// Loader global do next/image (images.loaderFile). Serve para tirar o
// otimizador do Next do caminho: ele baixava uma imagem já comprimida pelo
// Cloudinary e comprimia de novo, então a listagem levava perda dupla.
// Agora o Cloudinary entrega direto ao navegador, um w_ por entrada do srcset.
//
// c_limit nunca amplia: sem ele, um srcset de 3840px esticaria um original de
// 1200px, pesando mais e ficando pior. q_auto:best é o topo da escala
// automática — escolhe o menor arquivo que ainda é visualmente igual ao
// original, em vez do q_auto:good (padrão) que aceita perda visível.
const cloudinaryLoader = ({ src, width }: ImageLoaderProps) => {
  if (!src.includes("/image/upload/")) {
    return src
  }

  return src.replace("/image/upload/", `/image/upload/w_${width},c_limit,f_auto,q_auto:best/`)
}

export default cloudinaryLoader

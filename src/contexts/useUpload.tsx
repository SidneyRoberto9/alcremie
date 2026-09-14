"use client"

import { createContext, type ReactNode, useContext, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

interface UploadContextProps {
  imagesToUpload: File[]
  isLoading: boolean
  upload: () => Promise<void>
  remove: (remove: File) => void
  setImages: (imagesToUpload: File[]) => void
}

interface UploadContextProviderProps {
  children: ReactNode
}

const initialContext: UploadContextProps = {
  imagesToUpload: [],
  isLoading: false,
  upload: () => Promise.resolve(),
  remove: () => {},
  setImages: () => {},
}

const UploadContext = createContext<UploadContextProps>(initialContext)

export function UploadContextProvider({ children }: UploadContextProviderProps) {
  const [imagesToUpload, setImagesToUpload] = useState<File[]>(initialContext.imagesToUpload)
  const [isLoading, setIsLoading] = useState<boolean>(initialContext.isLoading)

  function setImages(images: File[]) {
    const list = new Set([...imagesToUpload, ...images])
    setImagesToUpload(Array.from(list))
  }

  function remove(remove: File) {
    if (isLoading) {
      return
    }

    setImagesToUpload((prev) => prev.filter((file, _) => file !== remove))
  }

  async function upload() {
    setIsLoading(true)

    const formData = new FormData()

    imagesToUpload.forEach((image) => {
      formData.append("image", image)
    })

    await fetch(`${API_URL}/upload`, { method: "POST", body: formData })

    // await toast.promise(), {
    //   pending: {
    //     render: 'Uploading...',
    //     position: toast.POSITION.BOTTOM_CENTER,
    //     autoClose: false,
    //     hideProgressBar: false,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: 'dark',
    //   },
    //   success: {
    //     render: 'Upload Success!',
    //     position: toast.POSITION.BOTTOM_CENTER,
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: 'dark',
    //   },
    //   error: {
    //     render: 'Upload Failed!',
    //     position: toast.POSITION.BOTTOM_CENTER,
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: 'dark',
    //   },
    // });

    setImagesToUpload([])
    setIsLoading(false)
  }

  return (
    <UploadContext.Provider
      value={{
        imagesToUpload,
        isLoading,
        upload,
        remove,
        setImages,
      }}
    >
      {children}
    </UploadContext.Provider>
  )
}

export const useUpload = () => useContext(UploadContext)

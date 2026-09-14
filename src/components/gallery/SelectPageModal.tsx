"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Minus, Plus, X } from "lucide-react"
import { Fragment, useState } from "react"
import { useGallery } from "@/contexts/useGallery"

export function SelectPageModal() {
  const { search, totalPage, filter } = useGallery()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [inputPage, setInputPage] = useState<number>(filter.page)

  const page = totalPage === 0 ? 0 : filter.page

  const handleClose = () => {
    setInputPage(page)
    setIsOpen(false)
  }
  const handleOpen = () => setIsOpen(true)
  const handlePlus = () => setInputPage(inputPage + 1)
  const handleMinus = () => setInputPage(inputPage - 1)
  const handleGoToPage = () => {
    search({ ...filter, page: inputPage })
    handleClose()
  }

  return (
    <Fragment>
      <button
        type="button"
        className="inline-flex w-full min-w-[4rem] max-w-[10rem] cursor-pointer select-none items-center justify-center px-2 py-3 text-sm text-zinc-100"
        onClick={handleOpen}
      >
        {page} / {totalPage}
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={handleClose}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-lucide-800/70" />
            </Transition.Child>
            <span className="inline-block h-screen align-middle" aria-hidden="true" />
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-lucide-600 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between text-zinc-100">
                  <span className="text-xl font-medium leading-6"> Page Selector</span>
                  <X onClick={handleClose} className="cursor-pointer" />
                </Dialog.Title>
                <div className="mt-4 p-4 text-sm">
                  <p>
                    You are on page {page} / {totalPage}
                  </p>
                  <p>There is 25 images in this category and a maximum of 25 images per page.</p>
                  <div className="m-auto mt-6 flex w-60 items-center gap-2">
                    <button
                      className="cursor-pointer rounded-md bg-white p-2 text-lucide-800 hover:bg-gray-500 disabled:bg-gray-500"
                      onClick={handleMinus}
                      disabled={inputPage === 1}
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      className="w-full select-none rounded-md border-2 border-white bg-lucide-600 p-2 text-center text-zinc-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={inputPage}
                      onChange={(e) => setInputPage(parseInt(e.target.value, 10))}
                      readOnly
                    />
                    <button
                      className="cursor-pointer rounded-md bg-white p-2 text-lucide-800 hover:bg-gray-500 disabled:bg-gray-500"
                      onClick={handlePlus}
                      disabled={inputPage === totalPage}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-row-reverse gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-violet-400 px-4 py-2 text-sm text-zinc-100 duration-300 hover:bg-violet-500"
                    onClick={handleGoToPage}
                  >
                    Go To Page
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-sm text-zinc-100 duration-300 hover:bg-gray-600"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  )
}

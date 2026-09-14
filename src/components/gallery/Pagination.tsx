"use client"

import { SelectPageModal } from "@/components/gallery/SelectPageModal"
import { useGallery } from "@/contexts/useGallery"

export function Pagination() {
  const { filter, search, totalPage } = useGallery()

  const page = filter.page
  const isFirstPage = page === 1
  const isLastPage = totalPage === page

  const onChangePage = (page: number) => search({ ...filter, page: page })
  const handleFirstPage = () => onChangePage(1)
  const handleLastPage = () => onChangePage(totalPage)
  const handleNextPage = () => onChangePage(page + 1)
  const handlePrevPage = () => onChangePage(page - 1)

  return (
    <div className="fixed bottom-2 left-[50vw] flex h-auto -translate-x-1/2 -translate-y-0 transform flex-col rounded-lg bg-rail">
      <div className="flex items-center justify-between px-1">
        <button
          className="m-1 h-7 w-16 min-w-[4rem] cursor-pointer rounded bg-accent text-sm font-medium capitalize text-ink transition-all duration-200 ease-in-out hover:brightness-90 disabled:cursor-not-allowed disabled:brightness-50"
          onClick={handleFirstPage}
          disabled={isFirstPage}
        >
          First
        </button>
        <button
          className="m-1 h-7 w-16 min-w-[4rem] cursor-pointer rounded bg-accent text-sm font-medium capitalize text-ink transition-all duration-200 ease-in-out hover:brightness-90 disabled:cursor-not-allowed disabled:brightness-50"
          onClick={handlePrevPage}
          disabled={isFirstPage}
        >
          Previous
        </button>

        <SelectPageModal />

        <button
          className="m-1 h-7 w-16 min-w-[4rem] cursor-pointer rounded bg-accent text-sm font-medium capitalize text-ink transition-all duration-200 ease-in-out hover:brightness-90 disabled:cursor-not-allowed disabled:brightness-50"
          onClick={handleNextPage}
          disabled={isLastPage}
        >
          Next
        </button>
        <button
          className="m-1 h-7 w-16 min-w-[4rem] cursor-pointer rounded bg-accent text-sm font-medium capitalize text-ink transition-all duration-200 ease-in-out hover:brightness-90 disabled:cursor-not-allowed disabled:brightness-50"
          onClick={handleLastPage}
          disabled={isLastPage}
        >
          Last
        </button>
      </div>
    </div>
  )
}

import Link from "next/link"
import { cn } from "@/lib/cn"

interface PaginationProps {
  page: number
  totalPage: number
  basePath: string
  tag?: string
}

export const Pagination = ({ page, totalPage, basePath, tag }: PaginationProps) => {
  const href = (n: number) => ({ pathname: basePath, query: { page: n, ...(tag ? { tag } : {}) } })
  const around = [page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= totalPage)

  return (
    <nav className="flex h-16 flex-none items-center justify-center gap-1 border-t border-line">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="flex h-11 items-center rounded-md px-3 text-sm text-ink-2 hover:bg-raise"
        >
          Previous
        </Link>
      ) : null}
      {around.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm tabular-nums",
            n === page ? "bg-accent font-semibold text-rail" : "text-ink-2 hover:bg-raise"
          )}
        >
          {n}
        </Link>
      ))}
      <span className="px-2 font-mono text-xs text-ink-3">… {totalPage}</span>
      {page < totalPage ? (
        <Link
          href={href(page + 1)}
          className="flex h-11 items-center rounded-md px-3 text-sm text-ink-2 hover:bg-raise"
        >
          Next
        </Link>
      ) : null}
    </nav>
  )
}

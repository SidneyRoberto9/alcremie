import type { ReactNode } from "react"

interface ItemListProps {
  children: ReactNode
}

export function ItemList({ children }: ItemListProps) {
  return <div className="grid-col-1 grid w-[400px]">{children}</div>
}

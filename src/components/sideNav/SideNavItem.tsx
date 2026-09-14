import type { LucideProps } from "lucide-react"
import Link from "next/link"
import type { FC, HTMLAttributes } from "react"

interface SideNavItemProps extends HTMLAttributes<HTMLAnchorElement> {
  title: string
  link: string
  icon: FC<LucideProps>
  isActive: boolean
  closeDrawer: () => void
}

export function SideNavItem({ title, link, icon: Icon, isActive, closeDrawer, ...props }: SideNavItemProps) {
  if (isActive) {
    return (
      <Link
        {...props}
        href={link}
        prefetch={false}
        onClick={closeDrawer}
        className="mx-3 flex w-11/12 items-center gap-2 rounded-lg bg-lucide-300 p-2 text-zinc-100"
      >
        <Icon size={24} />
        <p>{title}</p>
      </Link>
    )
  }

  return (
    <Link
      {...props}
      href={link}
      prefetch={false}
      onClick={closeDrawer}
      className="mx-3 flex w-11/12 items-center gap-2 rounded-lg p-2 text-zinc-100 transition-all duration-200 ease-in-out hover:bg-lucide-300"
    >
      <Icon size={24} />
      <p>{title}</p>
    </Link>
  )
}

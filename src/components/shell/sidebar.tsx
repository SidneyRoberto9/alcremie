"use client"

import { Fragment } from "react"
import { NavItem } from "@/components/shell/nav-item"
import { NAV_ITEMS } from "@/constant/navigation"

interface SectionProps {
  label: string
  section: string
}

const Section = ({ label, section }: SectionProps) => (
  <Fragment>
    <div className="px-2 pb-2 pt-5 font-mono text-[10px] tracking-[0.12em] text-ink-3 first:pt-0">{label}</div>
    {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
      <NavItem key={item.href} href={item.href} title={item.title} icon={item.icon} />
    ))}
  </Fragment>
)

export const Sidebar = () => (
  <aside data-probe="sidebar" className="flex w-60 flex-none flex-col bg-sidebar max-lg:hidden">
    <div className="flex h-[52px] items-center gap-2 border-b border-line px-4">
      <span className="font-display text-xl font-bold tracking-[0.02em] text-ink">Alcremie</span>
      <span className="pt-1 font-mono text-[10px] text-ink-3">v2</span>
    </div>
    <nav className="flex flex-col gap-0.5 p-2 pt-4">
      <Section label="BROWSE" section="browse" />
      <Section label="LIBRARY" section="library" />
    </nav>
  </aside>
)

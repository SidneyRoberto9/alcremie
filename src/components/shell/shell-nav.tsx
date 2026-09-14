"use client"

import { Fragment, useState } from "react"
import { Rail } from "@/components/shell/rail"
import { Sidebar } from "@/components/shell/sidebar"

export const ShellNav = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Fragment>
      <Rail isSidebarOpen={isOpen} onToggleSidebar={() => setIsOpen((previous) => !previous)} />
      {isOpen ? <Sidebar /> : null}
    </Fragment>
  )
}

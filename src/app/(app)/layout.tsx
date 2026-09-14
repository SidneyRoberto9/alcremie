import type { ReactNode } from "react"
import { ShellNav } from "@/components/shell/shell-nav"

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex h-screen overflow-hidden">
    <ShellNav />
    <main data-probe="content" className="flex min-w-0 grow flex-col overflow-y-auto bg-content">
      {children}
    </main>
  </div>
)

export default AppLayout

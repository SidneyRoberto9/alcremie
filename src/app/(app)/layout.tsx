import type { ReactNode } from "react"
import { Rail } from "@/components/shell/rail"
import { Sidebar } from "@/components/shell/sidebar"

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex h-screen overflow-hidden">
    <Rail />
    <Sidebar />
    <main data-probe="content" className="flex min-w-0 grow flex-col overflow-y-auto bg-content">
      {children}
    </main>
  </div>
)

export default AppLayout

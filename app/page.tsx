import { SidebarProvider } from '@/components/shell/sidebar-context'
import { Sidebar } from '@/components/shell/sidebar'
import { Header } from '@/components/shell/header'
import { DashboardContent } from '@/components/shell/dashboard-content'
import { requireAuth } from '@/lib/auth'

export default async function Page() {
  await requireAuth()

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Header />
          <DashboardContent />
        </main>
      </div>
    </SidebarProvider>
  )
}

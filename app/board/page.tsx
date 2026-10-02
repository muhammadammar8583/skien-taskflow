import { SidebarProvider } from '@/components/shell/sidebar-context'
import { Sidebar } from '@/components/shell/sidebar'
import { KanbanBoard } from '@/components/board/kanban-board'
import { requireAuth } from '@/lib/auth'

export default async function BoardPage() {
  await requireAuth()

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <KanbanBoard />
        </main>
      </div>
    </SidebarProvider>
  )
}

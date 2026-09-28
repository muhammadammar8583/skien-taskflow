import { SidebarProvider } from '@/components/shell/sidebar-context'
import { Sidebar } from '@/components/shell/sidebar'
import { KanbanBoard } from '@/components/board/kanban-board'

export default function BoardPage() {
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

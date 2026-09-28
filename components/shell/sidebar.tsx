'use client'

import { PanelLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'
import { OrgSwitcher } from './org-switcher'
import { SidebarNav } from './sidebar-nav'
import { UserMenu } from './user-menu'

export function Sidebar() {
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        'flex h-svh flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className={cn('flex items-center gap-1 p-2', collapsed && 'flex-col')}>
        <div className="min-w-0 flex-1">
          <OrgSwitcher />
        </div>
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      <Separator className="bg-sidebar-border" />

      <SidebarNav />

      <div className="mt-auto">
        <Separator className="bg-sidebar-border" />
        <div className="p-2">
          <UserMenu />
        </div>
      </div>
    </aside>
  )
}

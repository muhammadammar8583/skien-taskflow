'use client'

import { useState } from 'react'
import { LayoutDashboard, FolderKanban, Users, Settings, type LucideIcon, KanbanIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

type NavItem = {
  label: string
  icon: LucideIcon
}

const items: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Kanban board', icon: KanbanIcon },
  { label: 'Members', icon: Users },
  { label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  const { collapsed } = useSidebar()
  const [active, setActive] = useState('Dashboard')

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2" aria-label="Primary">
      {items.map((item) => {
        const isActive = active === item.label
        const button = (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex h-7 items-center gap-2.5 rounded-md px-2 text-[14px] transition-colors',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
            )}
          >
            <item.icon className="size-4 shrink-0" strokeWidth={2} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        )

        if (collapsed) {
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger render={button} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        }
        return button
      })}
    </nav>
  )
}

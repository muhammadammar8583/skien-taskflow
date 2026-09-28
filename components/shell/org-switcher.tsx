'use client'

import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

type Org = {
  name: string
  gradient: string
}

const orgs: Org[] = [
  { name: 'Acme Inc', gradient: 'from-violet-500 to-blue-500' },
  { name: 'Personal', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Side Hustle', gradient: 'from-orange-500 to-pink-500' },
]

function OrgAvatar({
  gradient,
  className,
  children,
}: {
  gradient: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[11px] font-semibold text-white',
        gradient,
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  )
}

export function OrgSwitcher() {
  const { collapsed } = useSidebar()
  const [active, setActive] = useState(orgs[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              'flex h-11 w-full items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-sidebar-accent',
              collapsed && 'justify-center px-0',
            )}
          />
        }
      >
        <OrgAvatar gradient={active.gradient} className="size-7">
          <span>{active.name.charAt(0)}</span>
        </OrgAvatar>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{active.name}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" sideOffset={6}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
          {orgs.map((org) => (
            <DropdownMenuItem
              key={org.name}
              onSelect={() => setActive(org)}
              className="gap-2"
            >
              <OrgAvatar gradient={org.gradient} className="size-6">
                <span>{org.name.charAt(0)}</span>
              </OrgAvatar>
              <span className="flex-1 truncate">{org.name}</span>
              {active.name === org.name && <Check className="size-4 text-violet-400" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 text-muted-foreground">
            <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-border">
              <Plus className="size-3.5" />
            </div>
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

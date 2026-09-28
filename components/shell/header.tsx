'use client'

import { ChevronRight, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Acme Inc</span>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <h1 className="font-medium text-foreground">Dashboard</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search…"
            aria-label="Search"
            className="h-7 w-56 rounded-md border border-input bg-secondary/40 pl-8 pr-14 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-secondary/60"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[13px]">
          <Plus className="size-3.5" />
          New Issue
        </Button>
      </div>
    </header>
  )
}

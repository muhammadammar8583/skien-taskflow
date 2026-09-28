'use client'

import { ChevronsUpDown, LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

const user = {
  name: 'Jordan Rivera',
  email: 'jordan@acme.inc',
  avatar: '/user-avatar.png',
}

export function UserMenu() {
  const { collapsed } = useSidebar()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              'flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-accent',
              collapsed && 'justify-center p-1',
            )}
          />
        }
      >
        <Avatar className="size-7 rounded-md">
          <AvatarImage src={user.avatar || '/placeholder.svg'} alt="" />
          <AvatarFallback className="rounded-md bg-violet-500/20 text-xs text-violet-300">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight">{user.name}</p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">{user.email}</p>
            </div>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56" sideOffset={6}>
        <div className="flex items-center gap-2 px-1.5 py-1.5">
          <Avatar className="size-7 rounded-md">
            <AvatarImage src={user.avatar || '/placeholder.svg'} alt="" />
            <AvatarFallback className="rounded-md bg-violet-500/20 text-xs text-violet-300">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium leading-tight">{user.name}</p>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="size-4" />
            Account settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive">
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

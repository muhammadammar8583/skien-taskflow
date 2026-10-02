'use client'

import { ChevronsUpDown, LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
import AppRoutes from '@/helpers/AppRoutes'
import { useAppSelector } from '@/store/store'
import { useAuthApis } from '@/hooks/useAuthApis'
import { useSidebar } from './sidebar-context'

const userAvatar = '/user-avatar.png'

export function UserMenu() {
  const router = useRouter()
  const { collapsed } = useSidebar()
  const { handleLogoutRequest } = useAuthApis()
  const user = useAppSelector((state) => state.auth.user)
  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const userEmail = user?.email ?? ''
  const avatarFallback = userName.charAt(0) || userEmail.charAt(0) || '?'

  async function handleLogout() {
    try {
      await handleLogoutRequest()
      router.replace(AppRoutes.pages.login)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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
          <AvatarImage src={userAvatar} alt="" />
          <AvatarFallback className="rounded-md bg-violet-500/20 text-xs text-violet-300">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight">{userName || userEmail}</p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">{userEmail}</p>
            </div>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56" sideOffset={6}>
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
          <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

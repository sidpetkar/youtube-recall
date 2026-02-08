"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SyncButton } from "@/components/sync-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function AppHeader() {
  const [user, setUser] = React.useState<SupabaseUser | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
    }
    getUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    ""
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  const nameParts = displayName.trim().split(/\s+/).filter(Boolean)
  const isSingleName = nameParts.length <= 1
  const firstName = nameParts[0] ?? ""
  const lastName = nameParts.slice(1).join(" ") ?? ""

  return (
    <header className="sticky top-0 z-40 w-full bg-sidebar">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8 w-full max-w-full">
        <SidebarTrigger className="md:hidden shrink-0" />
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="pl-9 rounded-[8px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SyncButton />
          <ThemeToggle />
          {user && (
            <>
              <div className="text-xs font-medium max-w-[120px] hidden sm:block text-right leading-tight">
                {isSingleName ? (
                  <span className="truncate block">{displayName}</span>
                ) : (
                  <>
                    <span className="truncate block">{firstName}</span>
                    <span className="truncate block text-muted-foreground">{lastName}</span>
                  </>
                )}
              </div>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                />
                <AvatarFallback className="text-xs">
                  {displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

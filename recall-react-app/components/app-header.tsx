"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SyncButton } from "@/components/sync-button"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-sidebar">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8 w-full max-w-full">
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
        </div>
      </div>
    </header>
  )
}

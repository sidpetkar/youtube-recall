"use client"

import * as React from "react"
import { Home, ThumbsUp, FolderTree, Settings, LogOut, PanelLeftClose, PanelRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { FolderList } from "@/components/folder-list"
import { RecallLogo } from "@/components/recall-logo"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Liked Videos",
    url: "/liked",
    icon: ThumbsUp,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderTree,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  selectedFolderId?: string
  onSelectFolder?: (folderId: string) => void
}

export function AppSidebar({ selectedFolderId, onSelectFolder }: AppSidebarProps) {
  const supabase = createClient()
  const router = useRouter()
  const { toggleSidebar } = useSidebar()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          {/* Full logo when expanded (moving gradient) */}
          <RecallLogo
            className={cn(
              "h-[58px] w-[150px]",
              "group-data-[collapsible=icon]:hidden"
            )}
          />
          {/* Icon logo when collapsed */}
          <img
            src="/recal-icon-128.png"
            alt="Recall"
            className={cn(
              "hidden h-8 w-8 shrink-0 object-contain",
              "group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-auto"
            )}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={menuItems[0].url}>
                    {React.createElement(menuItems[0].icon, {})}
                    <span>{menuItems[0].title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <FolderList
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
        />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(1).map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "flex p-2 gap-2",
            "group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center",
              "flex-1 min-w-0 group-data-[collapsible=icon]:flex-none"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
          {/* Collapse: visible when expanded, next to logout */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 group-data-[collapsible=icon]:hidden"
            )}
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          {/* Expand: visible when collapsed, below logout */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden h-8 w-8 shrink-0",
              "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            )}
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

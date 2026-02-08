"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { RecentlyLikedCarousel } from "@/components/recently-liked-carousel"
import { FoldersSection } from "@/components/folders-section"
import { AutoSync } from "@/components/auto-sync"
import { MainSheet } from "@/components/main-sheet"
import { useVideos } from "@/hooks/use-videos"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function AppHome() {
  const [user, setUser] = React.useState<any>(null)
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | undefined>()
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch latest 250 liked videos (no folder filter) so carousel shows all recent likes; refresh every minute
  const { data, isFetching } = useVideos(undefined, undefined, undefined, 250, 0, 60_000)

  // Refetch videos on every load/refresh so carousel shows most recent data
  React.useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
    }
  }, [user, queryClient])

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const recentVideos = (data?.videos || []).slice(0, 10).map((video) => ({
    dbId: video.id,
    videoId: video.youtube_id,
    title: video.title,
    channelName: video.channel_name,
    channelThumbnail: video.channel_thumbnail || undefined,
    thumbnail: video.thumbnail_url,
    duration: video.duration || undefined,
    publishedAt: video.liked_at || undefined,
    folderName: (video as any).folder?.name ?? null,
    resumeAtSeconds: (video as any).resume_at_seconds ?? null,
  }))

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    router.push(`/folders/${folderId}`)
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleFolderSelect}
      />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <MainSheet className="gap-8">
            <AutoSync />
            <RecentlyLikedCarousel videos={recentVideos} isLoading={isFetching} />
            <FoldersSection />
          </MainSheet>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

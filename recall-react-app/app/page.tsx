"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { RecentlyLikedCarousel } from "@/components/recently-liked-carousel"
import { FoldersSection } from "@/components/folders-section"
import { AutoSync } from "@/components/auto-sync"
import { useVideos } from "@/hooks/use-videos"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Home() {
  const [user, setUser] = React.useState<any>(null)
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | undefined>()
  const supabase = createClient()
  const router = useRouter()

  // Fetch only 10 videos for carousel
  const { data } = useVideos(undefined, undefined)

  React.useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }
      setUser(user)
    }

    getUser()

    // Listen for auth changes
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

  // Get only first 10 videos for carousel (most recently liked)
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

  return (
    <SidebarProvider>
      <AppSidebar 
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleFolderSelect}
      />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
          {/* Auto-sync component runs in background */}
          <AutoSync />

          <RecentlyLikedCarousel videos={recentVideos} isLoading={false} />
          
          <FoldersSection />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

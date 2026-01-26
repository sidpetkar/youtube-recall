"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { VideoCard } from "@/components/video-card"
import { DraggableVideoCard } from "@/components/draggable-video-card"
import { DraggableVideoListItem } from "@/components/draggable-video-list-item"
import { useVideos } from "@/hooks/use-videos"
import { useFolders } from "@/hooks/use-folders"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FolderPage() {
  const params = useParams()
  const folderId = params.id as string
  const [user, setUser] = React.useState<any>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const supabase = createClient()
  const router = useRouter()

  // Fetch videos for this folder
  const { data: videosData, isLoading: videosLoading, error } = useVideos(folderId)
  const { data: foldersData } = useFolders(false)

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

  const videos = videosData?.videos || []
  const folder = foldersData?.folders.find((f) => f.id === folderId)

  const handleFolderSelect = (selectedFolderId: string) => {
    router.push(`/folders/${selectedFolderId}`)
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        selectedFolderId={folderId}
        onSelectFolder={handleFolderSelect}
      />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {folder?.name || "Loading..."}
              </h1>
              <p className="text-sm text-muted-foreground">
                {videos.length} video{videos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList>
                <TabsTrigger value="grid" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {videosLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-video w-full bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">Error loading videos</h2>
                <p className="text-muted-foreground">
                  {error.message || "Failed to fetch videos"}
                </p>
              </div>
            </div>
          )}

          {!videosLoading && !error && videos.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">No videos in this folder</h2>
                <p className="text-muted-foreground">
                  Drag and drop videos here to organize them.
                </p>
              </div>
            </div>
          )}

          {!videosLoading && !error && videos.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <DraggableVideoCard
                  key={video.id}
                  videoDbId={video.id}
                  videoId={video.youtube_id}
                  title={video.title}
                  channelName={video.channel_name}
                  channelThumbnail={video.channel_thumbnail || undefined}
                  thumbnail={video.thumbnail_url}
                  duration={video.duration || undefined}
                  currentFolderId={folderId}
                />
              ))}
            </div>
          )}

          {!videosLoading && !error && videos.length > 0 && viewMode === "list" && (
            <div className="space-y-2">
              {videos.map((video) => (
                <DraggableVideoListItem
                  key={video.id}
                  videoId={video.youtube_id}
                  videoDbId={video.id}
                  title={video.title}
                  channelName={video.channel_name}
                  channelThumbnail={video.channel_thumbnail || undefined}
                  thumbnailUrl={video.thumbnail_url}
                  duration={video.duration || undefined}
                  likedAt={video.liked_at || undefined}
                  currentFolderId={folderId}
                />
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { VideoCard } from "@/components/video-card"
import { DraggableVideoCard } from "@/components/draggable-video-card"
import { DraggableVideoListItem } from "@/components/draggable-video-list-item"
import { useVideos } from "@/hooks/use-videos"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { LayoutGrid, List } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TagFilter } from "@/components/tag-filter"

export default function LikedVideosPage() {
  const [user, setUser] = React.useState<any>(null)
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | undefined>()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([])
  const supabase = createClient()
  const router = useRouter()

  // Fetch videos using React Query
  const { data, isLoading, error } = useVideos(
    selectedFolderId,
    undefined,
    selectedTagIds.length > 0 ? selectedTagIds : undefined
  )

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

  const videos = data?.videos || []

  const handleFolderSelect = (folderId: string) => {
    router.push(`/folders/${folderId}`)
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTagIds((prev) => [...prev, tagId])
  }

  const handleTagDeselect = (tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleFolderSelect}
      />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedFolderId ? "Folder Videos" : "Liked Videos"}
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

          {/* Tag Filter */}
          {!selectedFolderId && (
            <TagFilter
              selectedTagIds={selectedTagIds}
              onTagSelect={handleTagSelect}
              onTagDeselect={handleTagDeselect}
            />
          )}

          {isLoading && (
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

          {!isLoading && !error && videos.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">No videos yet</h2>
                <p className="text-muted-foreground">
                  Click "Sync Videos" to import your liked videos from YouTube.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && videos.length > 0 && viewMode === "grid" && (
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
                  currentFolderId={video.folder_id}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && videos.length > 0 && viewMode === "list" && (
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
                  currentFolderId={video.folder_id}
                />
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

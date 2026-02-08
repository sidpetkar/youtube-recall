"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useSyncVideos } from "@/hooks/use-videos"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

export function SyncButton() {
  const [youtubeConnected, setYoutubeConnected] = React.useState(false)
  const syncMutation = useSyncVideos()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()
  const refetchTimeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => {
    // Check if YouTube is connected
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("youtube_access_token")
          .eq("id", user.id)
          .single()

        setYoutubeConnected(!!profile?.youtube_access_token)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  React.useEffect(() => {
    return () => {
      refetchTimeoutsRef.current.forEach(clearTimeout)
      refetchTimeoutsRef.current = []
    }
  }, [])

  const handleSync = async () => {
    if (!youtubeConnected) {
      toast({
        title: "YouTube not connected",
        description: "Please sign in again to grant YouTube access",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await syncMutation.mutateAsync()

      if (result.success) {
        const isStarted = "startedAt" in result && result.startedAt
        if (isStarted && result.message) {
          toast({
            title: "Sync started",
            description: result.message,
          })
          const refetch = () => {
            queryClient.invalidateQueries({ queryKey: ["videos"] })
            queryClient.invalidateQueries({ queryKey: ["folders"] })
          }
          refetch()
          refetchTimeoutsRef.current.forEach(clearTimeout)
          refetchTimeoutsRef.current = [
            window.setTimeout(refetch, 20_000),
            window.setTimeout(refetch, 45_000),
          ]
        } else {
          const fromYt = result.totalFromYouTube ?? result.totalVideos
          const existing = result.existingCount ?? 0
          const newCount = result.newVideosCount
          let description: string
          if (fromYt === 0) {
            description =
              "No videos returned from YouTube. Make sure you've liked videos and that you connected YouTube with the same Google account you use on YouTube."
          } else {
            description = `Fetched ${fromYt} from YouTube. ${existing} already in library. ${newCount} new added.`
          }
          toast({
            title: "Sync complete",
            description,
          })
        }
      } else {
        const desc = result.youtubeError
          ? `YouTube: ${result.youtubeError} Try reconnecting YouTube in Settings (same Google account you use to like videos).`
          : result.errors?.join(", ") || "Unknown error"
        toast({
          title: "Sync failed",
          description: desc,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync videos",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncMutation.isPending}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
      {syncMutation.isPending ? "Syncing..." : "Sync Videos"}
    </Button>
  )
}

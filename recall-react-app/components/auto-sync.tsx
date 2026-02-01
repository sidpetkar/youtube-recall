"use client"

import * as React from "react"
import { useSyncVideos } from "@/hooks/use-videos"
import { createClient } from "@/lib/supabase/client"
import { shouldAutoSync, isDocumentVisible } from "@/lib/services/auto-sync"
import { useToast } from "@/components/ui/use-toast"

/**
 * AutoSync component handles automatic syncing of YouTube videos
 * - Syncs on every page load/refresh (when user lands on the app)
 * - Syncs on every login (SIGNED_IN auth event)
 * - Syncs when user switches back to the web app tab (visibilitychange)
 * - Periodic background sync every 30 minutes (when tab is visible)
 * - Manual "Sync Videos" button is still available in the header
 */
export function AutoSync() {
  const syncMutation = useSyncVideos()
  const { toast } = useToast()
  const supabase = createClient()
  const syncInProgressRef = React.useRef(false)

  const runSync = React.useCallback(
    async (showToast: boolean = false) => {
      if (syncInProgressRef.current || syncMutation.isPending) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("last_sync_at, youtube_access_token")
          .eq("id", user.id)
          .single()

        if (!profile?.youtube_access_token) return

        syncInProgressRef.current = true
        const result = await syncMutation.mutateAsync()

        if (result.success && showToast && result.newVideosCount > 0) {
          toast({
            title: "Sync complete",
            description: `Added ${result.newVideosCount} new video${result.newVideosCount !== 1 ? "s" : ""}`,
          })
        }
      } catch (error) {
        console.error("Auto-sync error:", error)
      } finally {
        syncInProgressRef.current = false
      }
    },
    [supabase, syncMutation, toast]
  )

  // Sync on every page load/refresh (mount)
  React.useEffect(() => {
    runSync(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount for page load/refresh

  // Sync on login (auth state change to SIGNED_IN)
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        runSync(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, runSync])

  // Sync when user switches back to the web app tab (e.g. after liking on YouTube)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runSync(false)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [runSync])

  // Periodic sync every 30 minutes (only if last sync was > 60 min ago)
  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!isDocumentVisible()) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("last_sync_at, youtube_access_token")
          .eq("id", user.id)
          .single()

        if (!profile?.youtube_access_token) return
        if (!shouldAutoSync(profile.last_sync_at, 60)) return

        await runSync(true)
      } catch {
        // ignore
      }
    }, 30 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [supabase, runSync])

  return null
}

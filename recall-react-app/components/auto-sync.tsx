"use client"

import * as React from "react"
import { useSyncVideos } from "@/hooks/use-videos"
import { createClient } from "@/lib/supabase/client"
import { shouldAutoSync, isDocumentVisible } from "@/lib/services/auto-sync"
import { useToast } from "@/components/ui/use-toast"

/**
 * AutoSync component handles automatic syncing of YouTube videos
 * - Syncs on login if last sync > 1 hour ago
 * - Periodic background sync every 30 minutes (when tab is visible)
 */
export function AutoSync() {
  const syncMutation = useSyncVideos()
  const { toast } = useToast()
  const supabase = createClient()
  const [hasInitialSynced, setHasInitialSynced] = React.useState(false)

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const checkAndSync = async (showToast: boolean = false) => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        // Get user profile to check last sync time and YouTube connection
        const { data: profile } = await supabase
          .from("profiles")
          .select("last_sync_at, youtube_access_token")
          .eq("id", user.id)
          .single()

        if (!profile || !profile.youtube_access_token) {
          return // YouTube not connected
        }

        // Check if should sync
        if (shouldAutoSync(profile.last_sync_at, 60)) {
          // 60 minutes
          console.log("Auto-syncing videos...")

          const result = await syncMutation.mutateAsync()

          if (result.success && showToast && result.newVideosCount > 0) {
            toast({
              title: "Auto-sync complete",
              description: `Added ${result.newVideosCount} new video${result.newVideosCount !== 1 ? "s" : ""}`,
            })
          }
        }
      } catch (error: any) {
        console.error("Auto-sync error:", error)
        // Don't show error toast for auto-sync to avoid annoying users
      }
    }

    // Initial sync on mount (only once per session)
    if (!hasInitialSynced) {
      checkAndSync(false) // Don't show toast on initial load
      setHasInitialSynced(true)
    }

    // Set up periodic sync (every 30 minutes)
    intervalId = setInterval(
      () => {
        if (isDocumentVisible()) {
          checkAndSync(true) // Show toast for periodic syncs
        }
      },
      30 * 60 * 1000
    ) // 30 minutes

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [supabase, syncMutation, toast, hasInitialSynced])

  // This component doesn't render anything
  return null
}

// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { VideoService } from "@/lib/services/video-service"

const syncInProgressByUser = new Map<string, boolean>()

/**
 * POST /api/videos/sync
 * Start sync of liked videos from YouTube. Returns immediately (202) and runs sync in background
 * so the request doesn't time out with 1000s of videos. Carousel refetches every 60s and will show new data.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    if (syncInProgressByUser.get(userId)) {
      return NextResponse.json(
        { success: true, message: "Sync already in progress. New videos will appear shortly.", alreadyRunning: true },
        { status: 200 }
      )
    }

    syncInProgressByUser.set(userId, true)
    const startedAt = new Date().toISOString()

    void VideoService.syncLikedVideos(userId)
      .then((result) => {
        if (result.success) {
          console.info("[Sync] completed for user:", userId, "newVideos:", result.newVideosCount)
        } else {
          console.error("[Sync] failed for user:", userId, result.errors)
        }
      })
      .catch((err) => {
        console.error("[Sync] error for user:", userId, err)
      })
      .finally(() => {
        syncInProgressByUser.delete(userId)
      })

    return NextResponse.json(
      {
        success: true,
        message: "Sync started. New videos will appear within a minute.",
        startedAt,
      },
      { status: 202 }
    )
  } catch (error: any) {
    console.error("Error in sync endpoint:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

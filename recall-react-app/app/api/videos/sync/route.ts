import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { VideoService } from "@/lib/services/video-service"

/**
 * POST /api/videos/sync
 * Trigger manual sync of liked videos from YouTube
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

    // Trigger sync
    const result = await VideoService.syncLikedVideos(user.id)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Sync failed",
          details: result.errors,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 200 })
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

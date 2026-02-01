// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { VideoService } from "@/lib/services/video-service"

/**
 * POST /api/videos/move
 * Move a video to a different folder
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

    const body = await request.json()
    const { videoId, newFolderId } = body

    if (!videoId || !newFolderId) {
      return NextResponse.json(
        { error: "videoId and newFolderId are required" },
        { status: 400 }
      )
    }

    // Move video
    await VideoService.moveVideo(videoId, newFolderId, user.id)

    return NextResponse.json(
      {
        success: true,
        videoId,
        newFolderId,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error moving video:", error)
    return NextResponse.json(
      {
        error: "Failed to move video",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

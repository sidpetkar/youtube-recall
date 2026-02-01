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

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      )
    }

    // newFolderId can be null to "remove from folder" (video becomes liked-only)
    if (newFolderId !== null && newFolderId !== undefined && typeof newFolderId !== "string") {
      return NextResponse.json(
        { error: "newFolderId must be a folder id or null" },
        { status: 400 }
      )
    }

    // Move video (or remove from folder when newFolderId is null)
    await VideoService.moveVideo(videoId, newFolderId ?? null, user.id)

    return NextResponse.json(
      {
        success: true,
        videoId,
        newFolderId: newFolderId ?? null,
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

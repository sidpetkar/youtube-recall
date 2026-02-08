export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/videos/[videoId]/notes
 * Returns notes for the current user's video (videoId = YouTube id).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: video, error } = await supabase
      .from("videos")
      .select("id, notes")
      .eq("user_id", user.id)
      .eq("youtube_id", videoId)
      .single()

    if (error || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({
      notes: video.notes ?? "",
    })
  } catch (e) {
    console.error("Error fetching notes:", e)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

/**
 * PATCH /api/videos/[videoId]/notes
 * Update notes for the current user's video. Body: { content: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const content = typeof body.content === "string" ? body.content : ""

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("id")
      .eq("user_id", user.id)
      .eq("youtube_id", videoId)
      .single()

    if (fetchError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from("videos")
      .update({ notes: content })
      .eq("id", video.id)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating notes:", updateError)
      return NextResponse.json({ error: "Failed to save notes" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Error saving notes:", e)
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 })
  }
}

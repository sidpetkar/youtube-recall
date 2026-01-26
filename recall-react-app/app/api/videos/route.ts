// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/videos
 * Fetch user's videos with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("folderId")
    const search = searchParams.get("search")
    const tagIds = searchParams.get("tagIds")?.split(",").filter(Boolean) || []
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build query
    let query = supabase
      .from("videos")
      .select(
        `
        *,
        folder:folders(*),
        tags:video_tags(tag:tags(*))
      `
      )
      .eq("user_id", user.id)
      .order("liked_at", { ascending: false })
      .limit(limit)

    // Apply filters
    if (folderId) {
      query = query.eq("folder_id", folderId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,channel_name.ilike.%${search}%`)
    }

    // Filter by tags if provided
    if (tagIds.length > 0) {
      // Get all tags (including children of selected parent tags)
      const { data: allTags, error: tagsError } = await supabase
        .from("tags")
        .select("id, parent_id")
        .eq("user_id", user.id)

      if (tagsError) {
        throw tagsError
      }

      // Expand tag IDs to include children of selected parent tags
      const expandedTagIds = new Set(tagIds)
      tagIds.forEach((tagId) => {
        // Find all child tags of this tag
        const childTags = allTags.filter((tag) => tag.parent_id === tagId)
        childTags.forEach((child) => expandedTagIds.add(child.id))
      })

      // Get video IDs that have any of the selected tags (including children)
      const { data: videoTags, error: videoTagsError } = await supabase
        .from("video_tags")
        .select("video_id")
        .in("tag_id", Array.from(expandedTagIds))

      if (videoTagsError) {
        throw videoTagsError
      }

      const videoIds = [...new Set(videoTags.map((vt) => vt.video_id))]
      
      if (videoIds.length > 0) {
        query = query.in("id", videoIds)
      } else {
        // No videos match the tags, return empty result
        return NextResponse.json({ videos: [] }, { status: 200 })
      }
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Transform data to include tags array
    const videos = data.map((video: any) => ({
      ...video,
      tags: video.tags?.map((vt: any) => vt.tag).filter(Boolean) || [],
    }))

    return NextResponse.json({ videos }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch videos",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/videos
 * Manually add a video by YouTube URL (future feature)
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented yet" },
    { status: 501 }
  )
}

/**
 * DELETE /api/videos/[id]
 * Delete a video
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("id")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", videoId)
      .eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting video:", error)
    return NextResponse.json(
      {
        error: "Failed to delete video",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

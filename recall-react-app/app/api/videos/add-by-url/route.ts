// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { createClient, createClientWithAuth } from "@/lib/supabase/server"
import { getVideoById } from "@/lib/youtube"
import { VideoService } from "@/lib/services/video-service"
import { extractYouTubeVideoId } from "@shared/utils/youtube"
import type { AddVideoByUrlRequest, AddVideoByUrlResponse } from "@shared/types/api"
import type { Video, Tag } from "@shared/types/database"

/**
 * POST /api/videos/add-by-url
 * Manually add a video by YouTube URL
 * Supports both cookie auth (web app) and Bearer token auth (Chrome extension)
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await createClientWithAuth(request)

    if (authError || !user) {
      return NextResponse.json<AddVideoByUrlResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body: AddVideoByUrlRequest = await request.json()
    const { url, folderId } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json<AddVideoByUrlResponse>(
        { success: false, error: "URL is required" },
        { status: 400 }
      )
    }

    // Extract YouTube video ID from URL
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return NextResponse.json<AddVideoByUrlResponse>(
        { success: false, error: "Invalid YouTube URL" },
        { status: 400 }
      )
    }

    // Check if video already exists
    const { data: existingVideo } = await supabase
      .from("videos")
      .select("id, youtube_id, title, folder_id")
      .eq("user_id", user.id)
      .eq("youtube_id", videoId)
      .single()

    if (existingVideo) {
      let folderName = "a folder"
      if (existingVideo.folder_id) {
        const { data: folder } = await supabase
          .from("folders")
          .select("name")
          .eq("id", existingVideo.folder_id)
          .single()
        if (folder?.name) {
          folderName = `"${folder.name}"`
        }
      }

      return NextResponse.json<AddVideoByUrlResponse>(
        {
          success: false,
          error: "Video already exists in your library",
          message: `"${existingVideo.title}" is already saved in ${folderName}`,
        },
        { status: 409 }
      )
    }

    // Get folder (use provided folderId or default Inbox)
    let targetFolderId = folderId
    if (!targetFolderId) {
      const { data: inboxFolder } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single()

      if (!inboxFolder) {
        return NextResponse.json<AddVideoByUrlResponse>(
          { success: false, error: "Default folder not found" },
          { status: 500 }
        )
      }
      targetFolderId = inboxFolder.id
    } else {
      // Verify user owns the folder
      const { data: folder } = await supabase
        .from("folders")
        .select("id")
        .eq("id", targetFolderId)
        .eq("user_id", user.id)
        .single()

      if (!folder) {
        return NextResponse.json<AddVideoByUrlResponse>(
          { success: false, error: "Folder not found or access denied" },
          { status: 404 }
        )
      }
    }

    // Fetch video metadata from YouTube
    const youtubeVideo = await getVideoById(videoId)

    // Insert video into database
    const { data: insertedVideo, error: insertError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        folder_id: targetFolderId,
        youtube_id: youtubeVideo.videoId,
        title: youtubeVideo.title,
        channel_name: youtubeVideo.channelName,
        channel_thumbnail: youtubeVideo.channelThumbnail || null,
        thumbnail_url: youtubeVideo.thumbnail,
        duration: youtubeVideo.duration || null,
        notes: null,
        liked_at: null,
      })
      .select()
      .single()

    if (insertError || !insertedVideo) {
      console.error("Error inserting video:", insertError)
      return NextResponse.json<AddVideoByUrlResponse>(
        { success: false, error: "Failed to save video" },
        { status: 500 }
      )
    }

    // Auto-tag the video
    await VideoService.autoTagVideo(insertedVideo.id, user.id, insertedVideo.title, supabase)

    // Fetch video with tags
    const { data: videoWithTags } = await supabase
      .from("videos")
      .select(
        `
        *,
        tags:video_tags(tag:tags(*))
      `
      )
      .eq("id", insertedVideo.id)
      .single()

    if (!videoWithTags) {
      return NextResponse.json<AddVideoByUrlResponse>(
        { success: false, error: "Video saved but failed to fetch" },
        { status: 500 }
      )
    }

    // Transform tags
    const video: Video & { tags: Tag[] } = {
      ...videoWithTags,
      tags: videoWithTags.tags?.map((vt: any) => vt.tag).filter(Boolean) || [],
    }

    return NextResponse.json<AddVideoByUrlResponse>(
      {
        success: true,
        video: video,
        message: "Video added successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error adding video by URL:", error)
    return NextResponse.json<AddVideoByUrlResponse>(
      {
        success: false,
        error: "Failed to add video",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}

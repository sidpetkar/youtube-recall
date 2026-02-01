// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { createClient, createClientWithAuth } from "@/lib/supabase/server"
import { getVideoById } from "@/lib/youtube"
import { VideoService } from "@/lib/services/video-service"
import { extractYouTubeVideoId } from "@shared/utils/youtube"
import type { AddVideoByUrlRequest, AddVideoByUrlResponse } from "@shared/types/api"
import type { Video, Tag } from "@shared/types/database"

/** Resolve target folder id: use provided folderId if valid, else default Inbox. */
async function resolveTargetFolderId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  folderId?: string
): Promise<string> {
  if (folderId) {
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single()
    if (folder) return folder.id
    throw new Error("Folder not found or access denied")
  }
  const { data: inboxFolder } = await supabase
    .from("folders")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single()
  if (!inboxFolder) throw new Error("Default folder not found")
  return inboxFolder.id
}

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
    const { url, folderId, resume_at_seconds } = body

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
      // Video already in a folder: cannot add again (user must move it)
      if (existingVideo.folder_id) {
        let folderName = "a folder"
        const { data: folder } = await supabase
          .from("folders")
          .select("name")
          .eq("id", existingVideo.folder_id)
          .single()
        if (folder?.name) {
          folderName = `"${folder.name}"`
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

      // Video exists but has no folder (liked-only): add it to the chosen folder (update folder_id)
      let targetFolderId: string
      try {
        targetFolderId = await resolveTargetFolderId(supabase, user.id, folderId)
      } catch (e: any) {
        const status = e.message?.includes("Folder not found") ? 404 : 500
        return NextResponse.json<AddVideoByUrlResponse>(
          { success: false, error: e.message || "Folder not found" },
          { status }
        )
      }
      const updatePayload: { folder_id: string; resume_at_seconds?: number | null } = { folder_id: targetFolderId }
      if (resume_at_seconds !== undefined && resume_at_seconds !== null) {
        updatePayload.resume_at_seconds = Math.max(0, Math.floor(Number(resume_at_seconds)))
      }
      const { error: updateError } = await supabase
        .from("videos")
        .update(updatePayload)
        .eq("id", existingVideo.id)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Error moving video to folder:", updateError)
        return NextResponse.json<AddVideoByUrlResponse>(
          { success: false, error: "Failed to add video to folder" },
          { status: 500 }
        )
      }

      const { data: videoWithTags } = await supabase
        .from("videos")
        .select(
          `
          *,
          tags:video_tags(tag:tags(*))
        `
        )
        .eq("id", existingVideo.id)
        .single()

      const video = videoWithTags
        ? {
            ...videoWithTags,
            tags: videoWithTags.tags?.map((vt: any) => vt.tag).filter(Boolean) || [],
          }
        : null

      return NextResponse.json<AddVideoByUrlResponse>(
        {
          success: true,
          video: video as any,
          message: "Video added to folder",
        },
        { status: 200 }
      )
    }

    // New video: resolve target folder (provided folder or default Inbox)
    let targetFolderId: string
    try {
      targetFolderId = await resolveTargetFolderId(supabase, user.id, folderId)
    } catch (e: any) {
      const status = e.message?.includes("Folder not found") ? 404 : 500
      return NextResponse.json<AddVideoByUrlResponse>(
        { success: false, error: e.message || "Folder not found" },
        { status }
      )
    }

    // Fetch video metadata from YouTube
    const youtubeVideo = await getVideoById(videoId)

    const resumeSeconds =
      resume_at_seconds !== undefined && resume_at_seconds !== null
        ? Math.max(0, Math.floor(Number(resume_at_seconds)))
        : null

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
        resume_at_seconds: resumeSeconds,
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

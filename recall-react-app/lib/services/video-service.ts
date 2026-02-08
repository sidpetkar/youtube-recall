import { createClient } from "@/lib/supabase/server"
import { getLikedVideos } from "@/lib/youtube"
import { detectTags, getTagColor } from "./sync-config"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/supabase"
import type {
  Video,
  VideoInsert,
  Folder,
  Tag,
  TagInsert,
  SyncResult,
  YouTubeVideo,
} from "@/lib/types/database"

/**
 * VideoService - Handles all video-related operations
 * Including sync, tagging, moving, and folder management
 */
export class VideoService {
  /**
   * Sync liked videos from YouTube for a user
   * Fetches videos, checks for duplicates, inserts new ones, and applies auto-tagging
   */
  static async syncLikedVideos(userId: string): Promise<SyncResult> {
    const supabase = await createClient()

    try {
      // Get user's profile with YouTube tokens
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("youtube_access_token, youtube_refresh_token")
        .eq("id", userId)
        .single()

      if (profileError || !profile) {
        throw new Error("User profile not found")
      }

      if (!profile.youtube_access_token) {
        throw new Error("YouTube not connected. Please connect your YouTube account first.")
      }

      // Persist refreshed tokens to profile so next sync uses fresh access_token (avoids stale-token issues)
      const onTokensRefreshed = async (tokens: {
        access_token?: string | null
        refresh_token?: string | null
      }) => {
        const updates: { youtube_access_token?: string; youtube_refresh_token?: string | null } = {}
        if (tokens.access_token) updates.youtube_access_token = tokens.access_token
        if (tokens.refresh_token !== undefined) updates.youtube_refresh_token = tokens.refresh_token ?? null
        if (Object.keys(updates).length > 0) {
          await supabase.from("profiles").update(updates).eq("id", userId)
        }
      }

      // Fetch only the 250 most recent from YouTube: carousel shows 10, liked page shows 50/250 then load more
      const SYNC_MAX_LIKED_VIDEOS = 250
      let youtubeVideos: Awaited<ReturnType<typeof getLikedVideos>>
      try {
        youtubeVideos = await getLikedVideos(
          profile.youtube_access_token,
          profile.youtube_refresh_token || undefined,
          SYNC_MAX_LIKED_VIDEOS,
          onTokensRefreshed
        )
      } catch (ytError: any) {
        const message = ytError?.message || String(ytError)
        console.error("YouTube API error in getLikedVideos:", message, ytError)
        return {
          success: false,
          newVideosCount: 0,
          totalVideos: 0,
          totalFromYouTube: 0,
          existingCount: 0,
          youtubeError: message,
          errors: [message],
          syncedAt: new Date().toISOString(),
        }
      }

      const totalFromYouTube = youtubeVideos.length

      if (youtubeVideos.length === 0) {
        return {
          success: true,
          newVideosCount: 0,
          totalVideos: 0,
          totalFromYouTube: 0,
          existingCount: 0,
          syncedAt: new Date().toISOString(),
        }
      }

      // Get existing video IDs so we can update their liked_at (order) and only insert truly new ones
      const youtubeIds = youtubeVideos.map((v) => v.videoId)
      const existingIds = await this.getExistingYouTubeIds(userId, youtubeIds)
      const existingCount = existingIds.length

      // Update liked_at for existing videos so DB order matches YouTube (carousel = 10 most recent)
      await this.updateLikedAtFromYouTube(userId, youtubeVideos)

      const newVideos = youtubeVideos.filter((v) => !existingIds.includes(v.videoId))
      let insertedCount = 0
      if (newVideos.length > 0) {
        const insertedVideos = await this.insertVideos(userId, newVideos, null)
        insertedCount = insertedVideos.length
      }

      // Update last sync time
      await supabase
        .from("profiles")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", userId)

      return {
        success: true,
        newVideosCount: insertedCount,
        totalVideos: youtubeVideos.length,
        totalFromYouTube: totalFromYouTube,
        existingCount,
        syncedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error("Error syncing liked videos:", error)
      return {
        success: false,
        newVideosCount: 0,
        totalVideos: 0,
        errors: [error.message || "Unknown error occurred"],
        syncedAt: new Date().toISOString(),
      }
    }
  }

  /** Chunk size for DB queries (Supabase/PostgREST can fail with very large .in() lists) */
  private static readonly EXISTING_IDS_CHUNK_SIZE = 300

  /**
   * Update liked_at for existing videos so DB order matches YouTube (carousel = 10 most recent).
   * Does not touch folder_id or other columns.
   */
  static async updateLikedAtFromYouTube(
    userId: string,
    youtubeVideos: { videoId: string; likedAt?: string }[]
  ): Promise<void> {
    const supabase = await createClient()
    const nowIso = new Date().toISOString()
    const BATCH = 50
    for (let i = 0; i < youtubeVideos.length; i += BATCH) {
      const batch = youtubeVideos.slice(i, i + BATCH)
      await Promise.all(
        batch.map((v) =>
          supabase
            .from("videos")
            .update({
              liked_at: v.likedAt ? new Date(v.likedAt).toISOString() : nowIso,
            })
            .eq("user_id", userId)
            .eq("youtube_id", v.videoId)
        )
      )
    }
  }

  /**
   * Get existing YouTube IDs for a user.
   * Batched so we don't exceed URL/query limits when user has 1000s of videos.
   */
  static async getExistingYouTubeIds(userId: string, youtubeIds: string[]): Promise<string[]> {
    const supabase = await createClient()
    const existing: string[] = []

    for (let i = 0; i < youtubeIds.length; i += VideoService.EXISTING_IDS_CHUNK_SIZE) {
      const chunk = youtubeIds.slice(i, i + VideoService.EXISTING_IDS_CHUNK_SIZE)
      const { data, error } = await supabase
        .from("videos")
        .select("youtube_id")
        .eq("user_id", userId)
        .in("youtube_id", chunk)

      if (error) {
        console.error("Error fetching existing video IDs (chunk):", error.message || error)
        continue
      }
      existing.push(...(data?.map((v) => v.youtube_id) ?? []))
    }

    return existing
  }

  /** Insert batch size to avoid huge payloads and timeouts */
  private static readonly INSERT_BATCH_SIZE = 100

  /**
   * Insert new videos with auto-tagging.
   * Uses upsert with ignoreDuplicates so we never fail on duplicate key (e.g. if existing-ID check was partial).
   * folderId = null: liked-only (Liked page + carousel, not in any folder).
   */
  static async insertVideos(
    userId: string,
    youtubeVideos: YouTubeVideo[],
    folderId: string | null
  ): Promise<Video[]> {
    const supabase = await createClient()
    const nowIso = new Date().toISOString()
    const allInserted: Video[] = []

    for (let i = 0; i < youtubeVideos.length; i += VideoService.INSERT_BATCH_SIZE) {
      const batch = youtubeVideos.slice(i, i + VideoService.INSERT_BATCH_SIZE)
      const videoInserts: VideoInsert[] = batch.map((ytVideo) => ({
        user_id: userId,
        folder_id: folderId,
        youtube_id: ytVideo.videoId,
        title: ytVideo.title,
        channel_name: ytVideo.channelName,
        channel_thumbnail: ytVideo.channelThumbnail || null,
        thumbnail_url: ytVideo.thumbnail,
        duration: ytVideo.duration || null,
        notes: null,
        liked_at: ytVideo.likedAt ? new Date(ytVideo.likedAt).toISOString() : nowIso,
      }))

      const { data: insertedVideos, error: insertError } = await supabase
        .from("videos")
        .upsert(videoInserts, {
          onConflict: "user_id,youtube_id",
          ignoreDuplicates: true,
        })
        .select()

      if (insertError) {
        console.error("Error inserting videos (batch):", insertError)
        throw new Error("Failed to insert videos")
      }

      const inserted = insertedVideos ?? []
      allInserted.push(...inserted)

      for (const video of inserted) {
        await this.autoTagVideo(video.id, userId, video.title)
      }
    }

    return allInserted
  }

  /**
   * Auto-tag a video based on its title
   */
  static async autoTagVideo(
    videoId: string,
    userId: string,
    title: string,
    supabaseClient?: SupabaseClient<Database>
  ): Promise<void> {
    const detectedTagNames = detectTags(title)

    if (detectedTagNames.length === 0) {
      return // No tags detected
    }

    const supabase = supabaseClient || await createClient()

    // Get or create tags
    for (const tagName of detectedTagNames) {
      const tag = await this.getOrCreateTag(userId, tagName, getTagColor(tagName), supabase)

      // Link video to tag
      await supabase.from("video_tags").insert({
        video_id: videoId,
        tag_id: tag.id,
      })
    }
  }

  /**
   * Get or create a tag
   */
  static async getOrCreateTag(
    userId: string,
    tagName: string,
    color?: string,
    supabaseClient?: SupabaseClient<Database>
  ): Promise<Tag> {
    const supabase = supabaseClient || await createClient()

    // Try to get existing tag
    const { data: existingTag } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .eq("name", tagName)
      .single()

    if (existingTag) {
      return existingTag
    }

    // Create new tag
    const { data: newTag, error } = await supabase
      .from("tags")
      .insert({
        user_id: userId,
        name: tagName,
        color: color || "#6366f1",
      })
      .select()
      .single()

    if (error || !newTag) {
      throw new Error(`Failed to create tag: ${tagName}`)
    }

    return newTag
  }

  /**
   * Move a video to a different folder, or remove from folder (set folder_id to null).
   * When newFolderId is null, the video becomes "liked only" (Liked page + carousel, not in any folder).
   */
  static async moveVideo(videoId: string, newFolderId: string | null, userId: string): Promise<void> {
    const supabase = await createClient()

    // Verify user owns the video
    const { data: video } = await supabase
      .from("videos")
      .select("id, user_id")
      .eq("id", videoId)
      .eq("user_id", userId)
      .single()

    if (!video) {
      throw new Error("Video not found or you don't have permission")
    }

    if (newFolderId === null) {
      // Remove from folder: set folder_id to null (video stays in library, appears on Liked page only)
      const { error } = await supabase
        .from("videos")
        .update({ folder_id: null })
        .eq("id", videoId)
        .eq("user_id", userId)
      if (error) {
        throw new Error("Failed to remove video from folder")
      }
      return
    }

    // Verify user owns the folder
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("id", newFolderId)
      .eq("user_id", userId)
      .single()

    if (!folder) {
      throw new Error("Folder not found or you don't have permission")
    }

    // Update video's folder
    const { error } = await supabase
      .from("videos")
      .update({ folder_id: newFolderId })
      .eq("id", videoId)

    if (error) {
      throw new Error("Failed to move video")
    }
  }

  /**
   * Get user's folders
   */
  static async getUserFolders(userId: string): Promise<Folder[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("position_index", { ascending: true })

    if (error) {
      throw new Error("Failed to fetch folders")
    }

    return data || []
  }

  /**
   * Create a new folder
   */
  static async createFolder(userId: string, name: string): Promise<Folder> {
    const supabase = await createClient()

    // Get max position_index
    const { data: folders } = await supabase
      .from("folders")
      .select("position_index")
      .eq("user_id", userId)
      .order("position_index", { ascending: false })
      .limit(1)

    const nextPosition = folders && folders.length > 0 ? folders[0].position_index + 1 : 0

    const { data, error } = await supabase
      .from("folders")
      .insert({
        user_id: userId,
        name: name,
        position_index: nextPosition,
        is_default: false,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error("Failed to create folder")
    }

    return data
  }

  /**
   * Reorder folders (for drag-drop)
   */
  static async reorderFolders(userId: string, folderIds: string[]): Promise<void> {
    const supabase = await createClient()

    // Update position_index for each folder
    for (let i = 0; i < folderIds.length; i++) {
      await supabase
        .from("folders")
        .update({ position_index: i })
        .eq("id", folderIds[i])
        .eq("user_id", userId)
    }
  }

  /**
   * Delete a folder (only if not default and empty)
   */
  static async deleteFolder(folderId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    // Check if folder is default
    const { data: folder } = await supabase
      .from("folders")
      .select("is_default")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single()

    if (!folder) {
      throw new Error("Folder not found")
    }

    if (folder.is_default) {
      throw new Error("Cannot delete default Inbox folder")
    }

    // Check if folder has videos
    const { count } = await supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("folder_id", folderId)

    if (count && count > 0) {
      throw new Error("Cannot delete folder with videos. Move videos first.")
    }

    // Delete folder
    const { error } = await supabase.from("folders").delete().eq("id", folderId).eq("user_id", userId)

    if (error) {
      throw new Error("Failed to delete folder")
    }
  }
}

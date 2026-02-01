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

      // Fetch liked videos from YouTube API (callback saves refreshed tokens to profile)
      // Sync as much as possible (up to 250) so latest changes are reflected
      let youtubeVideos: Awaited<ReturnType<typeof getLikedVideos>>
      try {
        youtubeVideos = await getLikedVideos(
          profile.youtube_access_token,
          profile.youtube_refresh_token || undefined,
          250,
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

      // Get existing video IDs to avoid duplicates
      const youtubeIds = youtubeVideos.map((v) => v.videoId)
      const existingIds = await this.getExistingYouTubeIds(userId, youtubeIds)
      const existingCount = existingIds.length

      // Filter out videos that already exist
      const newVideos = youtubeVideos.filter((v) => !existingIds.includes(v.videoId))

      if (newVideos.length === 0) {
        // Update last sync time even if no new videos
        await supabase
          .from("profiles")
          .update({ last_sync_at: new Date().toISOString() })
          .eq("id", userId)

        return {
          success: true,
          newVideosCount: 0,
          totalVideos: youtubeVideos.length,
          totalFromYouTube: totalFromYouTube,
          existingCount,
          syncedAt: new Date().toISOString(),
        }
      }

      // Insert new liked videos without assigning to any folder (liked-only: appear on Liked page and carousel only)
      const insertedVideos = await this.insertVideos(userId, newVideos, null)

      // Update last sync time
      await supabase
        .from("profiles")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", userId)

      return {
        success: true,
        newVideosCount: insertedVideos.length,
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

  /**
   * Get existing YouTube IDs for a user
   */
  static async getExistingYouTubeIds(userId: string, youtubeIds: string[]): Promise<string[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("videos")
      .select("youtube_id")
      .eq("user_id", userId)
      .in("youtube_id", youtubeIds)

    if (error) {
      console.error("Error fetching existing video IDs:", error)
      return []
    }

    return data.map((v) => v.youtube_id)
  }

  /**
   * Insert new videos with auto-tagging.
   * folderId = null: liked-only (Liked page + carousel, not in any folder).
   * folderId = string: video is in that folder (and also on Liked page + carousel).
   */
  static async insertVideos(
    userId: string,
    youtubeVideos: YouTubeVideo[],
    folderId: string | null
  ): Promise<Video[]> {
    const supabase = await createClient()

    // Prepare video inserts - use likedAt (when user liked) or fallback to now so new syncs appear in carousel
    const nowIso = new Date().toISOString()
    const videoInserts: VideoInsert[] = youtubeVideos.map((ytVideo) => ({
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

    // Insert videos
    const { data: insertedVideos, error: insertError } = await supabase
      .from("videos")
      .insert(videoInserts)
      .select()

    if (insertError) {
      console.error("Error inserting videos:", insertError)
      throw new Error("Failed to insert videos")
    }

    // Auto-tag each video
    for (const video of insertedVideos) {
      await this.autoTagVideo(video.id, userId, video.title)
    }

    return insertedVideos
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

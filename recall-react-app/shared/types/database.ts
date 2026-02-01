// Database types matching Supabase schema for YouTube Knowledge Manager

// ============================================================================
// BASE DATABASE TYPES
// ============================================================================

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  youtube_access_token: string | null
  youtube_refresh_token: string | null
  youtube_connected_at: string | null
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  position_index: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  folder_id: string | null
  youtube_id: string
  title: string
  channel_name: string
  channel_thumbnail: string | null
  thumbnail_url: string
  duration: string | null
  notes: string | null
  liked_at: string | null
  resume_at_seconds: number | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  parent_id: string | null
  created_at: string
}

export interface TagWithChildren extends Tag {
  children: Tag[]
}

export interface VideoTag {
  video_id: string
  tag_id: string
  created_at: string
}

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

export interface VideoWithTags extends Video {
  tags: Tag[]
  folder?: Folder
}

export interface VideoWithDetails extends Video {
  tags: Tag[]
  folder: Folder
}

export interface FolderWithCount extends Folder {
  video_count?: number
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type ProfileInsert = Omit<Profile, "id" | "created_at" | "updated_at"> & {
  id: string // Required for profile as it comes from auth.users
}

export type FolderInsert = Omit<Folder, "id" | "created_at" | "updated_at">

export type VideoInsert = Omit<Video, "id" | "created_at" | "updated_at">

export type TagInsert = Omit<Tag, "id" | "created_at">

export type VideoTagInsert = Omit<VideoTag, "created_at">

// ============================================================================
// UPDATE TYPES (for updating records)
// ============================================================================

export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at" | "updated_at">>

export type FolderUpdate = Partial<Omit<Folder, "id" | "user_id" | "created_at" | "updated_at">>

export type VideoUpdate = Partial<Omit<Video, "id" | "user_id" | "youtube_id" | "created_at" | "updated_at">>

export type TagUpdate = Partial<Omit<Tag, "id" | "user_id" | "created_at">>

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SyncResult {
  success: boolean
  newVideosCount: number
  totalVideos: number
  errors?: string[]
  syncedAt: string
}

export interface MoveVideoResult {
  success: boolean
  videoId: string
  oldFolderId: string
  newFolderId: string
}

export interface FolderReorderResult {
  success: boolean
  updatedFolders: Folder[]
}

// ============================================================================
// YOUTUBE API TYPES (for sync service)
// ============================================================================

export interface YouTubeVideo {
  videoId: string
  title: string
  channelName: string
  channelThumbnail?: string
  thumbnail: string
  duration?: string
  publishedAt?: string
  likedAt?: string
}

export interface YouTubeTokens {
  access_token: string
  refresh_token?: string
  expiry_date?: number
}

// ============================================================================
// FILTER AND QUERY TYPES
// ============================================================================

export interface VideoFilters {
  folderId?: string
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

export interface FolderFilters {
  includeCount?: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DatabaseTable = "profiles" | "folders" | "videos" | "tags" | "video_tags"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export class VideoServiceError extends Error {
  code: string
  details?: string

  constructor(message: string, code: string, details?: string) {
    super(message)
    this.name = "VideoServiceError"
    this.code = code
    this.details = details
  }
}

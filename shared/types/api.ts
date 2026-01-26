// API response types for Chrome extension and web app

import { Video, Tag } from "./database"

// ============================================================================
// ADD VIDEO BY URL API
// ============================================================================

export interface AddVideoByUrlRequest {
  url: string
  folderId?: string
}

export interface AddVideoByUrlResponse {
  success: boolean
  video?: Video & { tags: Tag[] }
  error?: string
  message?: string
}

// ============================================================================
// FOLDER API RESPONSES
// ============================================================================

export interface GetFoldersResponse {
  folders: Array<{
    id: string
    user_id: string
    name: string
    position_index: number
    is_default: boolean
    created_at: string
    updated_at: string
    video_count?: number
  }>
}

// ============================================================================
// VIDEO API RESPONSES
// ============================================================================

export interface GetVideosResponse {
  videos: Array<Video & { tags: Tag[] }>
}

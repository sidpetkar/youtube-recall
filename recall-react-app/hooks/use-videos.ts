"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { VideoWithTags, SyncResult } from "@/lib/types/database"

/**
 * Fetch videos with optional filters and pagination.
 * limit/offset: 50 per page; hasMore indicates if "Load more" can fetch more.
 * refetchIntervalMs: when set, refetch this query every N ms (e.g. 60000 for carousel to update every minute).
 */
export function useVideos(
  folderId?: string,
  search?: string,
  tagIds?: string[],
  limit: number = 50,
  offset: number = 0,
  refetchIntervalMs?: number
) {
  return useQuery<{ videos: VideoWithTags[]; hasMore: boolean }>({
    queryKey: ["videos", folderId, search, tagIds?.join(","), limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (folderId) params.append("folderId", folderId)
      if (search) params.append("search", search)
      if (tagIds && tagIds.length > 0) {
        params.append("tagIds", tagIds.join(","))
      }
      params.set("limit", String(limit))
      params.set("offset", String(offset))

      const response = await fetch(`/api/videos?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch videos")
      }
      return response.json()
    },
    refetchInterval: refetchIntervalMs ?? false,
  })
}

/**
 * Sync liked videos from YouTube
 */
export function useSyncVideos() {
  const queryClient = useQueryClient()

  return useMutation<SyncResult>({
    mutationFn: async () => {
      const response = await fetch("/api/videos/sync", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sync videos")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch videos after successful sync
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

/**
 * Move a video to a different folder, or remove from folder (newFolderId: null).
 */
export function useMoveVideo() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; videoId: string; newFolderId: string | null },
    Error,
    { videoId: string; newFolderId: string | null }
  >({
    mutationFn: async ({ videoId, newFolderId }) => {
      const response = await fetch("/api/videos/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, newFolderId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to move video")
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate videos and folders to refresh counts
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

/**
 * Delete a video
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (videoId: string) => {
      const response = await fetch(`/api/videos?id=${videoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete video")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

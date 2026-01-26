"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { VideoWithTags, SyncResult } from "@/lib/types/database"

/**
 * Fetch videos with optional filters
 */
export function useVideos(
  folderId?: string,
  search?: string,
  tagIds?: string[]
) {
  return useQuery<{ videos: VideoWithTags[] }>({
    queryKey: ["videos", folderId, search, tagIds?.join(",")],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (folderId) params.append("folderId", folderId)
      if (search) params.append("search", search)
      if (tagIds && tagIds.length > 0) {
        params.append("tagIds", tagIds.join(","))
      }

      const response = await fetch(`/api/videos?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch videos")
      }
      return response.json()
    },
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
 * Move a video to a different folder
 */
export function useMoveVideo() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; videoId: string; newFolderId: string },
    Error,
    { videoId: string; newFolderId: string }
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
      // Invalidate videos query to refetch
      queryClient.invalidateQueries({ queryKey: ["videos"] })
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

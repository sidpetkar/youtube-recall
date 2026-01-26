"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

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
      // Invalidate all video and folder queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Folder, FolderWithCount } from "@/lib/types/database"

/**
 * Fetch user's folders with optional video counts
 */
export function useFolders(includeCount: boolean = true) {
  return useQuery<{ folders: FolderWithCount[] }>({
    queryKey: ["folders", includeCount],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (includeCount) params.append("includeCount", "true")

      const response = await fetch(`/api/folders?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch folders")
      }
      return response.json()
    },
  })
}

/**
 * Create a new folder
 */
export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation<{ folder: Folder }, Error, { name: string }>({
    mutationFn: async ({ name }) => {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create folder")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

/**
 * Reorder folders (for drag-drop)
 */
export function useReorderFolders() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, { folderIds: string[] }>({
    mutationFn: async ({ folderIds }) => {
      const response = await fetch("/api/folders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderIds }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reorder folders")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
  })
}

/**
 * Delete a folder
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (folderId: string) => {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete folder")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] })
      queryClient.invalidateQueries({ queryKey: ["videos"] })
    },
  })
}

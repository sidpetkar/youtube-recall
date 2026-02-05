import React, { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { getSessionFromCookies } from "../../lib/supabase"
import folderIconUrl from "../../../assets/icons/folder-icon.png?url"
import { fetchFolders, addVideoByUrl } from "../../lib/api"
import { LoadingSpinner } from "./LoadingSpinner"
import type { Folder } from "@shared/types/database"

interface FolderSelectorProps {
  videoUrl: string
}

export function FolderSelector({ videoUrl }: FolderSelectorProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()

  // Fetch folders
  const { data: folders, isLoading, error } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const token = await getSessionFromCookies()
      if (!token) throw new Error("Not authenticated")
      return fetchFolders(token)
    },
  })

  // Add video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const token = await getSessionFromCookies()
      if (!token) throw new Error("Not authenticated")
      return addVideoByUrl(videoUrl, folderId, token)
    },
    onSuccess: (result, folderId) => {
      if (result.success) {
        const folder = folders?.find(f => f.id === folderId)
        setSuccessMessage(`Saved to "${folder?.name || "folder"}"`)
        setErrorMessage(undefined)
        
        // Close popup after 1.5 seconds
        setTimeout(() => window.close(), 1500)
      } else {
        setErrorMessage(result.message || result.error || "Failed to save video")
        setSuccessMessage(undefined)
      }
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "An error occurred")
      setSuccessMessage(undefined)
    },
  })

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId)
    addVideoMutation.mutate(folderId)
  }

  if (isLoading) {
    return (
      <div className="w-[420px] min-h-[320px] flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-[420px] p-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Failed to load folders</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[420px] min-h-[320px] flex flex-col p-4">
      <div className="pb-3">
        <h2 className="text-lg font-bold tracking-tight">Save to Folder</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a folder for this video
        </p>
      </div>

      {successMessage && (
        <div className="mb-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 max-h-[320px]">
        {folders && folders.length > 0 ? (
          <div className="space-y-2 pr-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                disabled={addVideoMutation.isPending}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left dark:bg-white dark:hover:bg-gray-50"
              >
                <img
                  src={folderIconUrl}
                  alt=""
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {folder.name}
                    {folder.is_default && (
                      <span className="text-xs text-muted-foreground font-normal ml-1.5">
                        (default)
                      </span>
                    )}
                  </p>
                  {"video_count" in folder && folder.video_count !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {folder.video_count} video{folder.video_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {addVideoMutation.isPending && selectedFolderId === folder.id && (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No folders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

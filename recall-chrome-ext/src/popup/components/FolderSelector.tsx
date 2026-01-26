import React, { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Folder as FolderIcon, Check, Loader2, AlertCircle } from "lucide-react"
import { getSessionFromCookies } from "../../lib/supabase"
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
      <div className="w-80 p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-80 p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Failed to load folders</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Save to Folder</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Choose a folder for this video
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {folders && folders.length > 0 ? (
          <div className="divide-y">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                disabled={addVideoMutation.isPending}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <FolderIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {folder.name}
                    {folder.is_default && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (default)
                      </span>
                    )}
                  </p>
                  {"video_count" in folder && folder.video_count !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {folder.video_count} video{folder.video_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {addVideoMutation.isPending && selectedFolderId === folder.id && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <p className="text-sm">No folders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

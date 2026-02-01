"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useFolders } from "@/hooks/use-folders"
import { useMoveVideo } from "@/hooks/use-move-video"
import { useToast } from "@/components/ui/use-toast"
import {
  Folder,
  FolderMinus,
  ExternalLink,
  Copy,
  Share2,
  Trash2,
  Heart,
  HeartOff,
  Download,
} from "lucide-react"

interface VideoContextMenuProps {
  children: React.ReactNode
  videoDbId: string
  videoId: string
  title: string
  currentFolderId?: string
  /** When set, "Open in YouTube" starts at this position (seconds) */
  resumeAtSeconds?: number | null
  isLiked?: boolean
  onUnlike?: () => void
  onDelete?: () => void
}

export function VideoContextMenu({
  children,
  videoDbId,
  videoId,
  title,
  currentFolderId,
  resumeAtSeconds,
  isLiked = true,
  onUnlike,
  onDelete,
}: VideoContextMenuProps) {
  const { data } = useFolders(true)
  const moveVideoMutation = useMoveVideo()
  const { toast } = useToast()

  const folders = data?.folders || []

  const handleMoveToFolder = async (folderId: string, folderName: string) => {
    if (folderId === currentFolderId) {
      toast({
        title: "Already in this folder",
        description: `Video is already in "${folderName}"`,
      })
      return
    }

    try {
      await moveVideoMutation.mutateAsync({
        videoId: videoDbId,
        newFolderId: folderId,
      })

      toast({
        title: "Video moved",
        description: `Moved to "${folderName}"`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to move video",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRemoveFromFolder = async () => {
    try {
      await moveVideoMutation.mutateAsync({
        videoId: videoDbId,
        newFolderId: null,
      })

      toast({
        title: "Removed from folder",
        description: "Video is now in Liked Videos only (not in any folder)",
      })
    } catch (error: any) {
      toast({
        title: "Failed to remove from folder",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getYouTubeUrl = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`
    if (resumeAtSeconds != null && resumeAtSeconds > 0) {
      return `${url}&t=${Math.floor(resumeAtSeconds)}`
    }
    return url
  }

  const handleOpenVideo = () => {
    window.open(getYouTubeUrl(), "_blank")
  }

  const handleOpenChannel = () => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
      "_blank"
    )
  }

  const handleCopyLink = () => {
    const url = getYouTubeUrl()
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "Video link copied to clipboard",
    })
  }

  const handleShareVideo = async () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        })
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleDownloadVideo = () => {
    // Open in a new tab to use browser extensions or download sites
    window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      "_blank"
    )
    toast({
      title: "Opening video",
      description: "Use a browser extension or download site to save the video",
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Move to Folder - Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Folder className="mr-2 h-4 w-4" />
            Move to folder
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 max-h-[300px] overflow-y-auto">
            {folders.length === 0 ? (
              <ContextMenuItem disabled>No folders available</ContextMenuItem>
            ) : (
              folders.map((folder) => (
                <ContextMenuItem
                  key={folder.id}
                  onClick={() => handleMoveToFolder(folder.id, folder.name)}
                  disabled={folder.id === currentFolderId}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  {folder.name}
                  {folder.id === currentFolderId && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Current
                    </span>
                  )}
                </ContextMenuItem>
              ))
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Remove from folder - only when video is in a folder */}
        {currentFolderId && (
          <ContextMenuItem onClick={handleRemoveFromFolder}>
            <FolderMinus className="mr-2 h-4 w-4" />
            Remove from folder
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Open Video */}
        <ContextMenuItem onClick={handleOpenVideo}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in YouTube
        </ContextMenuItem>

        {/* Copy Link */}
        <ContextMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </ContextMenuItem>

        {/* Share Video */}
        <ContextMenuItem onClick={handleShareVideo}>
          <Share2 className="mr-2 h-4 w-4" />
          Share video
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Download hint */}
        <ContextMenuItem onClick={handleDownloadVideo}>
          <Download className="mr-2 h-4 w-4" />
          Download info
        </ContextMenuItem>

        {/* Unlike/Remove from Liked (if applicable) */}
        {isLiked && onUnlike && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onUnlike} className="text-orange-600">
              <HeartOff className="mr-2 h-4 w-4" />
              Remove from liked
            </ContextMenuItem>
          </>
        )}

        {/* Delete Video (if applicable) */}
        {onDelete && (
          <>
            {!isLiked && <ContextMenuSeparator />}
            <ContextMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete video
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

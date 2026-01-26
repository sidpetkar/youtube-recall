"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { FolderTile } from "@/components/folder-tile"
import { useFolders } from "@/hooks/use-folders"
import { useCreateFolder } from "@/hooks/use-folders"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface FolderListRowProps {
  folder: {
    id: string
    name: string
    video_count?: number
  }
  onClick: () => void
}

function FolderListRow({ folder, onClick }: FolderListRowProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `list-${folder.id}`,
    data: {
      type: "folder",
      folderId: folder.id,
      folderName: folder.name,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors",
        isOver && "ring-2 ring-primary bg-accent"
      )}
      onClick={onClick}
    >
      <div className="rounded-full bg-amber-500/10 p-2">
        <svg
          className="h-5 w-5 text-amber-600 dark:text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{folder.name}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        {folder.video_count || 0} videos
      </div>
    </div>
  )
}

export function FoldersSection() {
  const { data, isLoading } = useFolders(true)
  const createFolderMutation = useCreateFolder()
  const { toast } = useToast()
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")

  const folders = data?.folders || []
  const topFolders = folders.slice(0, 5) // First 5 folders for tiles (to make 6 tiles with Add button)
  const remainingFolders = folders.slice(5) // Rest for list view

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    try {
      await createFolderMutation.mutateAsync({ name: newFolderName })
      toast({
        title: "Folder created",
        description: `"${newFolderName}" has been created`,
      })
      setNewFolderName("")
      setCreateDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Failed to create folder",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Folders</h2>
      </div>

      {/* Tile View - 3x2 grid with 5 folders + Add button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topFolders.map((folder) => (
          <FolderTile
            key={folder.id}
            id={folder.id}
            name={folder.name}
            videoCount={folder.video_count}
          />
        ))}
        <FolderTile
          isAddButton
          onAddClick={() => setCreateDialogOpen(true)}
        />
      </div>

      {/* List/Table View for remaining folders */}
      {remainingFolders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">More folders</h3>
          <div className="space-y-2">
            {remainingFolders.map((folder) => (
              <FolderListRow
                key={folder.id}
                folder={folder}
                onClick={() => router.push(`/folders/${folder.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder()
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={createFolderMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

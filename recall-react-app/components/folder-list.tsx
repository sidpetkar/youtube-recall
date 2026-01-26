"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Folder, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useFolders, useCreateFolder, useDeleteFolder } from "@/hooks/use-folders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FolderListProps {
  selectedFolderId?: string
  onSelectFolder?: (folderId: string) => void
}

interface FolderItemProps {
  folder: {
    id: string
    name: string
    is_default: boolean
    video_count?: number
  }
  isActive: boolean
  onSelect: (folderId: string) => void
  onEdit: (folder: { id: string; name: string }) => void
  onDelete: (folderId: string) => void
}

function FolderItem({ folder, isActive, onSelect, onEdit, onDelete }: FolderItemProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `sidebar-${folder.id}`,
    data: {
      type: "folder",
      folderId: folder.id,
      folderName: folder.name,
    },
  })

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      className={cn(
        "transition-colors rounded-md",
        isOver && "bg-accent"
      )}
    >
      <div className="flex items-center w-full group/folder">
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => onSelect(folder.id)}
          className="flex-1"
        >
          <Folder className="h-4 w-4" />
          <span>{folder.name}</span>
          {folder.video_count !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              {folder.video_count}
            </span>
          )}
        </SidebarMenuButton>
        {!folder.is_default && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover/folder:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit({ id: folder.id, name: folder.name })}
              >
                <Pencil className="h-3 w-3 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(folder.id)}
                className="text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </SidebarMenuItem>
  )
}

export function FolderList({ selectedFolderId, onSelectFolder }: FolderListProps) {
  const { data, isLoading } = useFolders(true)
  const createFolderMutation = useCreateFolder()
  const deleteFolderMutation = useDeleteFolder()
  const [newFolderName, setNewFolderName] = React.useState("")
  const [editingFolder, setEditingFolder] = React.useState<{ id: string; name: string } | null>(null)
  const [deletingFolderId, setDeletingFolderId] = React.useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()

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

  const handleEditFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/folders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingFolder.id, name: editingFolder.name }),
      })

      if (!response.ok) {
        throw new Error("Failed to update folder")
      }

      toast({
        title: "Folder updated",
        description: `Folder renamed to "${editingFolder.name}"`,
      })
      setEditingFolder(null)
      setEditDialogOpen(false)
      
      // Refresh folders
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Failed to update folder",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteFolder = async () => {
    if (!deletingFolderId) return

    try {
      await deleteFolderMutation.mutateAsync(deletingFolderId)
      toast({
        title: "Folder deleted",
        description: "The folder and its videos have been moved to Inbox",
      })
      setDeletingFolderId(null)
      
      // If we're on the folder page, redirect to home
      if (selectedFolderId === deletingFolderId) {
        router.push("/")
      }
    } catch (error: any) {
      toast({
        title: "Failed to delete folder",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleFolderClick = (folderId: string) => {
    if (onSelectFolder) {
      onSelectFolder(folderId)
    }
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Folders</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="text-sm text-muted-foreground p-2">Loading...</div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  const folders = data?.folders || []

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Folders</span>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
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
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isActive={selectedFolderId === folder.id}
              onSelect={handleFolderClick}
              onEdit={(f) => {
                setEditingFolder(f)
                setEditDialogOpen(true)
              }}
              onDelete={setDeletingFolderId}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
            <DialogDescription>
              Enter a new name for the folder
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={editingFolder?.name || ""}
            onChange={(e) =>
              setEditingFolder(editingFolder ? { ...editingFolder, name: e.target.value } : null)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEditFolder()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFolderId} onOpenChange={(open) => !open && setDeletingFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder. All videos in this folder will be moved to your Inbox.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  )
}

"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Folder, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface FolderTileProps {
  id?: string
  name?: string
  videoCount?: number
  isAddButton?: boolean
  onAddClick?: () => void
  onDrop?: (videoId: string, folderId: string) => void
}

export function FolderTile({
  id,
  name,
  videoCount,
  isAddButton = false,
  onAddClick,
  onDrop,
}: FolderTileProps) {
  const router = useRouter()

  const { isOver, setNodeRef } = useDroppable({
    id: id || "add-button",
    disabled: isAddButton,
    data: {
      type: "folder",
      folderId: id,
      folderName: name,
    },
  })

  const handleClick = () => {
    if (isAddButton && onAddClick) {
      onAddClick()
    } else if (id) {
      router.push(`/folders/${id}`)
    }
  }

  if (isAddButton) {
    return (
      <Card
        className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-dashed border-2"
        onClick={handleClick}
      >
        <CardContent className="p-4 flex items-center gap-3 h-20">
          <div className="rounded-lg bg-primary/10 p-2 shrink-0">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Add new folder</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
        isOver && "ring-2 ring-primary bg-accent"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-center gap-3 h-20">
        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2 shrink-0">
          <Folder className="h-6 w-6 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-0.5 truncate">{name}</h3>
          <p className="text-xs text-muted-foreground">{videoCount || 0} videos</p>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { VideoContextMenu } from "./video-context-menu"
import { cn } from "@/lib/utils"

interface DraggableVideoListItemProps {
  videoId: string
  videoDbId: string
  title: string
  channelName: string
  channelThumbnail?: string
  thumbnailUrl: string
  duration?: string
  likedAt?: string
  currentFolderId?: string
}

export function DraggableVideoListItem({
  videoId,
  videoDbId,
  title,
  channelName,
  channelThumbnail,
  thumbnailUrl,
  duration,
  likedAt,
  currentFolderId,
}: DraggableVideoListItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `list-${videoDbId}`,
    data: {
      type: "video",
      videoId,
      videoDbId,
      title,
      channelName,
      channelThumbnail,
      thumbnail: thumbnailUrl,
      duration,
      likedAt,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only open if not dragging
    if (!isDragging) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
    }
  }

  // Filter out onContextMenu from listeners to allow context menu to work
  const { onContextMenu, ...dragListeners } = listeners || {}

  return (
    <VideoContextMenu
      videoDbId={videoDbId}
      videoId={videoId}
      title={title}
      currentFolderId={currentFolderId}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...dragListeners}
        {...attributes}
        className={cn(
          "touch-none",
          isDragging && "opacity-50 cursor-grabbing",
          !isDragging && "cursor-grab"
        )}
      >
        <Card
          className="transition-all hover:shadow-md"
          onClick={handleClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-40 shrink-0 aspect-video overflow-hidden rounded">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
                {duration && (
                  <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
                    {duration}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-2">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{channelName}</p>
                {likedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(likedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VideoContextMenu>
  )
}

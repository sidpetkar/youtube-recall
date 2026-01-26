"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { VideoCard, VideoCardProps } from "./video-card"
import { VideoContextMenu } from "./video-context-menu"
import { cn } from "@/lib/utils"

export interface DraggableVideoCardProps extends VideoCardProps {
  videoDbId: string // The database ID (not YouTube ID)
  currentFolderId?: string
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function DraggableVideoCard({
  videoDbId,
  videoId,
  title,
  channelName,
  channelThumbnail,
  thumbnail,
  duration,
  publishedAt,
  currentFolderId,
  onDragStart,
  onDragEnd,
  className,
  ...props
}: DraggableVideoCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: videoDbId,
    data: {
      type: "video",
      videoId,
      videoDbId,
      title,
      channelName,
      channelThumbnail,
      thumbnail,
      duration,
      publishedAt,
    },
  })

  React.useEffect(() => {
    if (isDragging) {
      onDragStart?.()
    } else {
      onDragEnd?.()
    }
  }, [isDragging, onDragStart, onDragEnd])

  const style = {
    transform: CSS.Translate.toString(transform),
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
          "transition-opacity touch-none",
          isDragging && "opacity-50 cursor-grabbing",
          !isDragging && "cursor-grab"
        )}
      >
        <VideoCard
          videoId={videoId}
          title={title}
          channelName={channelName}
          channelThumbnail={channelThumbnail}
          thumbnail={thumbnail}
          duration={duration}
          publishedAt={publishedAt}
          className={className}
          {...props}
        />
      </div>
    </VideoContextMenu>
  )
}

"use client"

import * as React from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { useMoveVideo } from "@/hooks/use-move-video"
import { useToast } from "@/components/ui/use-toast"
import { VideoCard } from "@/components/video-card"

interface DragData {
  type: "video"
  videoId: string
  videoDbId: string
  title: string
  channelName: string
  channelThumbnail?: string
  thumbnail: string
  duration?: string
  publishedAt?: string
}

interface DropData {
  type: "folder"
  folderId: string
  folderName?: string
}

export function DndProvider({ children }: { children: React.ReactNode }) {
  const [activeVideo, setActiveVideo] = React.useState<DragData | null>(null)
  const moveVideoMutation = useMoveVideo()
  const { toast } = useToast()

  // Configure sensors with activation constraints
  // This prevents drag from interfering with carousel scroll
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms press to start drag
        tolerance: 5, // Allow 5px movement during delay
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const dragData = active.data.current as DragData
    if (dragData?.type === "video") {
      setActiveVideo(dragData)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveVideo(null)

    if (!over) return

    const dragData = active.data.current as DragData
    const dropData = over.data.current as DropData

    // Validate that we're dropping a video on a folder
    if (dragData?.type !== "video" || dropData?.type !== "folder") {
      return
    }

    const { videoDbId } = dragData
    const { folderId, folderName } = dropData

    if (!videoDbId || !folderId) {
      return
    }

    try {
      await moveVideoMutation.mutateAsync({
        videoId: videoDbId,
        newFolderId: folderId,
      })

      toast({
        title: "Video moved",
        description: `Video moved to "${folderName || "folder"}"`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to move video",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeVideo ? (
          <div className="opacity-80 rotate-3 cursor-grabbing">
            <VideoCard
              videoId={activeVideo.videoId}
              title={activeVideo.title}
              channelName={activeVideo.channelName}
              channelThumbnail={activeVideo.channelThumbnail}
              thumbnail={activeVideo.thumbnail}
              duration={activeVideo.duration}
              publishedAt={activeVideo.publishedAt}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
